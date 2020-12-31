import JMath3D from "../JMath3D";
import PhysicsSystem from "./PhysicsSystem";
import Vector3 from "../math/Vector3";
import JConstraint from "./JConstraint";

export default class JConstraintPoint extends JConstraint {
    constructor(body0, body0Pos, body1, body1Pos, allowedDistance, timescale) {
        super();
        this._maxVelMag = 20;
        this._minVelForProcessing = 0.01;
        this._body0 = null;
        this._body1 = null;
        this._body0Pos = null;
        this._body1Pos = null;
        this._timescale = null;
        this._allowedDistance = null;
        this.r0 = null;
        this.r1 = null;
        this._worldPos = null;
        this._vrExtra = null;
        this._body0 = body0;
        this._body0Pos = body0Pos;
        this._body1 = body1;
        this._body1Pos = body1Pos;
        this._allowedDistance = allowedDistance;
        this._timescale = timescale;
        if (this._timescale < JMath3D.NUM_TINY) {
            this._timescale = JMath3D.NUM_TINY;
        }
        this._constraintEnabled = false;
        this.enableConstraint();
    }

    enableConstraint() {
        if (this._constraintEnabled) {
            return;
        }
        this._constraintEnabled = true;
        this._body0.addConstraint(this);
        this._body1.addConstraint(this);
        PhysicsSystem.getInstance().addConstraint(this);
    }

    disableConstraint() {
        if (!this._constraintEnabled) {
            return;
        }
        this._constraintEnabled = false;
        this._body0.removeConstraint(this);
        this._body1.removeConstraint(this);
        PhysicsSystem.getInstance().removeConstraint(this);

    }

    preApply(dt) {
        this.satisfied = false;

        this.r0 = this._body0.getCurrState().orientation.transformVector(this._body0Pos);
        this.r1 = this._body1.getCurrState().orientation.transformVector(this._body1Pos);

        const worldPos0 = this._body0.getCurrState().position.add(this.r0);
        const worldPos1 = this._body1.getCurrState().position.add(this.r1);
        this._worldPos = new Vector3(worldPos0.add(worldPos1).x * 0.5, worldPos0.add(worldPos1).y * 0.5, worldPos0.add(worldPos1).z * 0.5);
        const deviation = worldPos0.subtract(worldPos1);
        const deviationAmount = deviation.getLength();
        if (deviationAmount > this._allowedDistance) {
            this._vrExtra = new Vector3(deviation.x * (deviationAmount - this._allowedDistance) / (deviationAmount * Math.max(this._timescale, dt)), deviation.y * (deviationAmount - this._allowedDistance) / (deviationAmount * Math.max(this._timescale, dt)), deviation.z * (deviationAmount - this._allowedDistance) / (deviationAmount * Math.max(this._timescale, dt)));
        } else {
            this._vrExtra = new Vector3();
        }
    }

    apply(dt) {
        this.satisfied = true;

        if (!this._body0._isActive && !this._body1._isActive) {
            return false;
        }

        const currentVel0 = this._body0.getVelocity(this.r0);
        const currentVel1 = this._body1.getVelocity(this.r1);
        let Vr = this._vrExtra.add(currentVel0.subtract(currentVel1));
        let normalVel = Vr.getLength();
        if (normalVel < this._minVelForProcessing) {
            return false;
        }

        if (normalVel > this._maxVelMag) {
            const limit = this._maxVelMag / normalVel;
            Vr = new Vector3(Vr.x * limit, Vr.y * limit, Vr.z * limit);
            normalVel = this._maxVelMag;
        }

        const N = new Vector3(Vr.x / normalVel, Vr.y / normalVel, Vr.z / normalVel);
        let tempVec1 = this.r0.cross(N);
        tempVec1 = this._body0.getWorldInvInertia().transformVector(tempVec1);
        let tempVec2 = this.r1.cross(N);
        tempVec2 = this._body1.getWorldInvInertia().transformVector(tempVec2);
        const denominator = this._body0.getInvMass() + this._body1.getInvMass() + N.dot(tempVec1.cross(this.r0)) + N.dot(tempVec2.cross(this.r1));
        if (denominator < JMath3D.NUM_TINY) {
            return false;
        }

        const impulseFactor = -normalVel / denominator;
        const normalImpulse0 = new Vector3(N.x * impulseFactor, N.y * impulseFactor, N.z * impulseFactor);
        const normalImpulse1 = new Vector3(-normalImpulse0.x, -normalImpulse0.y, -normalImpulse0.z);

        this._body0.applyWorldImpulse(normalImpulse0, this._worldPos);
        this._body1.applyWorldImpulse(normalImpulse1, this._worldPos);
        this._body0.setConstraintsAndCollisionsUnsatisfied();
        this._body1.setConstraintsAndCollisionsUnsatisfied();
        this.satisfied = true;
        return true;
    }
}
