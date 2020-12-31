import JMath3D from "../JMath3D";
import JConstraint from "./JConstraint";
import PhysicsSystem from "./PhysicsSystem";
import Vector3 from "../math/Vector3";

export default class JConstraintWorldPoint extends JConstraint {
    constructor(body, pointOnBody, worldPosition) {
        super();
        this.minVelForProcessing = 0.001;
        this.allowedDeviation = 0.01;
        this.timescale = 4;
        this._body = null;
        this._pointOnBody = null;
        this._worldPosition = null;
        this._body = body;
        this._pointOnBody = pointOnBody;
        this._worldPosition = worldPosition;
        this._constraintEnabled = false;
        this.enableConstraint();
    }

    set_worldPosition(pos) {
        this._worldPosition = pos;
    }

    get_worldPosition() {
        return this._worldPosition;
    }

    enableConstraint() {
        if (this._constraintEnabled) {
            return;
        }
        this._constraintEnabled = true;
        this._body.addConstraint(this);
        PhysicsSystem.getInstance().addConstraint(this);

    }

    disableConstraint() {
        if (!this._constraintEnabled) {
            return;
        }
        this._constraintEnabled = false;
        this._body.removeConstraint(this);
        PhysicsSystem.getInstance().removeConstraint(this);

    }

    apply(dt) {
        let desiredVel;
        this.satisfied = true;
        let worldPos = this._body.getCurrState().orientation.transformVector(this._pointOnBody);
        worldPos = worldPos.add(this._body.getCurrState().position);
        const R = worldPos.subtract(this._body.getCurrState().position);
        const currentVel = this._body.getCurrState().linVelocity.add(this._body.getCurrState().rotVelocity.cross(R));
        const deviation = worldPos.subtract(this._worldPosition);
        const deviationDistance = deviation.getLength();
        if (deviationDistance > this.allowedDeviation) {
            const deviationDir = new Vector3(deviation.x / deviationDistance, deviation.y / deviationDistance, deviation.z / deviationDistance);
            desiredVel = new Vector3(deviationDir.x * (this.allowedDeviation - deviationDistance) / (this.timescale * dt), deviationDir.y * (this.allowedDeviation - deviationDistance) / (this.timescale * dt), deviationDir.z * (this.allowedDeviation - deviationDistance) / (this.timescale * dt));
        } else {
            desiredVel = new Vector3();
        }

        let N = currentVel.subtract(desiredVel);
        const normalVel = N.getLength();
        if (normalVel < this.minVelForProcessing) {
            return false;
        }
        N = new Vector3(N.x / normalVel, N.y / normalVel, N.z / normalVel);
        let tempV = R.cross(N);
        tempV = this._body.getWorldInvInertia().transformVector(tempV);
        const denominator = this._body.getInvMass() + N.dot(tempV.cross(R));
        if (denominator < JMath3D.NUM_TINY) {
            return false;
        }

        const normalImpulse = -normalVel / denominator;
        this._body.applyWorldImpulse(new Vector3(N.x * normalImpulse, N.y * normalImpulse, N.z * normalImpulse), worldPos);
        this._body.setConstraintsAndCollisionsUnsatisfied();
        this.satisfied = true;

        return true;
    }
}
