import JMath3D from "../JMath3D";
import JConstraint from "./JConstraint";
import PhysicsSystem from "./PhysicsSystem";
import Vector3 from "../math/Vector3";

export default class JConstraintMaxDistance extends JConstraint {
    constructor(body0, body0Pos, body1, body1Pos, maxDistance) {
        super([]);
        this._maxVelMag = 20;
        this._minVelForProcessing = 0.01;
        this._body0 = null;
        this._body1 = null;
        this._body0Pos = null;
        this._body1Pos = null;
        this._maxDistance = null;
        this.r0 = null;
        this.r1 = null;
        this._worldPos = null;
        this._currentRelPos0 = null;
        this._body0 = body0;
        this._body0Pos = body0Pos;
        this._body1 = body1;
        this._body1Pos = body1Pos;
        this._maxDistance = maxDistance;

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
        this._currentRelPos0 = worldPos0.subtract(worldPos1);

    }

    apply(dt) {
        this.satisfied = true;

        if (!this._body0._isActive && !this._body1._isActive) {
            return false;
        }

        const currentVel0 = this._body0.getVelocity(this.r0);
        const currentVel1 = this._body1.getVelocity(this.r1);
        const predRelPos0 = this._currentRelPos0.add(new Vector3(currentVel0.subtract(currentVel1).x * dt, currentVel0.subtract(currentVel1).y * dt, currentVel0.subtract(currentVel1).z * dt));
        let clampedRelPos0 = predRelPos0.clone();
        const clampedRelPos0Mag = clampedRelPos0.getLength();
        if (clampedRelPos0Mag <= JMath3D.NUM_TINY) {
            return false;
        }
        if (clampedRelPos0Mag > this._maxDistance) {
            clampedRelPos0 = new Vector3(clampedRelPos0.x * this._maxDistance / clampedRelPos0Mag, clampedRelPos0.y * this._maxDistance / clampedRelPos0Mag, clampedRelPos0.z * this._maxDistance / clampedRelPos0Mag);
        }

        const desiredRelVel0 = new Vector3(clampedRelPos0.subtract(this._currentRelPos0).x / dt, clampedRelPos0.subtract(this._currentRelPos0).y / dt, clampedRelPos0.subtract(this._currentRelPos0).z / dt);
        let Vr = currentVel0.subtract(currentVel1).subtract(desiredRelVel0);
        let normalVel = Vr.getLength();
        if (normalVel > this._maxVelMag) {
            Vr = new Vector3(Vr.x * this._maxVelMag / normalVel, Vr.y * this._maxVelMag / normalVel, Vr.z * this._maxVelMag / normalVel);
            normalVel = this._maxVelMag;
        } else if (normalVel < this._minVelForProcessing) {
            return false;
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

        const normalImpulse = new Vector3(N.x * -normalVel / denominator, N.y * -normalVel / denominator, N.z * -normalVel / denominator);
        this._body0.applyWorldImpulse(normalImpulse, this._worldPos);
        this._body1.applyWorldImpulse(new Vector3(normalImpulse.x * -1, normalImpulse.y * -1, normalImpulse.z * -1), this._worldPos);
        this._body0.setConstraintsAndCollisionsUnsatisfied();
        this._body1.setConstraintsAndCollisionsUnsatisfied();
        this.satisfied = true;
        return true;
    }
}
