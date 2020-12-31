import Vector3 from "../math/Vector3";
import PhysicsController from "./PhysicsController";
import PhysicsSystem from "./PhysicsSystem";
import JConstraintMaxDistance from "./JConstraintMaxDistance";
import JConstraintPoint from "./JConstraintPoint";
import Matrix44 from "../math/Matrix44";

export default class HingeJoint extends PhysicsController {
    constructor(body0, body1, hingeAxis, hingePosRel0, hingeHalfWidth, hingeFwdAngle, hingeBckAngle, sidewaysSlack, damping) {
        super();
        this.MAX_HINGE_ANGLE_LIMIT = 150;
        this._hingeAxis = null;
        this._hingePosRel0 = null;
        this._body0 = null;
        this._body1 = null;
        this._usingLimit = null;
        this._broken = null;
        this._damping = null;
        this._extraTorque = null;
        this.sidePointConstraints = null;
        this.midPointConstraint = null;
        this.maxDistanceConstraint = null;
        this._body0 = body0;
        this._body1 = body1;
        this._hingeAxis = hingeAxis.clone();
        this._hingePosRel0 = hingePosRel0.clone();
        this._usingLimit = false;
        this._controllerEnabled = false;
        this._broken = false;
        this._damping = damping;
        this._extraTorque = 0;
        this._hingeAxis.normalize();
        const _hingePosRel1 = this._body0.getCurrState().position.add(this._hingePosRel0.subtract(this._body1.getCurrState().position));
        const relPos0a = this._hingePosRel0.add(new Vector3(this._hingeAxis.x * hingeHalfWidth, this._hingeAxis.y * hingeHalfWidth, this._hingeAxis.z * hingeHalfWidth));
        const relPos0b = this._hingePosRel0.subtract(new Vector3(this._hingeAxis.x * hingeHalfWidth, this._hingeAxis.y * hingeHalfWidth, this._hingeAxis.z * hingeHalfWidth));
        const relPos1a = _hingePosRel1.add(new Vector3(this._hingeAxis.x * hingeHalfWidth, this._hingeAxis.y * hingeHalfWidth, this._hingeAxis.z * hingeHalfWidth));
        const relPos1b = _hingePosRel1.subtract(new Vector3(this._hingeAxis.x * hingeHalfWidth, this._hingeAxis.y * hingeHalfWidth, this._hingeAxis.z * hingeHalfWidth));
        const timescale = 1 / 20;
        const allowedDistanceMid = 0.005;
        const allowedDistanceSide = sidewaysSlack * hingeHalfWidth;
        this.sidePointConstraints = [];
        this.sidePointConstraints[0] = new JConstraintMaxDistance(this._body0, relPos0a, this._body1, relPos1a, allowedDistanceSide);
        this.sidePointConstraints[1] = new JConstraintMaxDistance(this._body0, relPos0b, this._body1, relPos1b, allowedDistanceSide);
        this.midPointConstraint = new JConstraintPoint(this._body0, this._hingePosRel0, this._body1, _hingePosRel1, allowedDistanceMid, timescale);
        if (hingeFwdAngle <= this.MAX_HINGE_ANGLE_LIMIT) {
            let perpDir = Vector3.Y_AXIS;
            if (perpDir.dot(this._hingeAxis) > 0.1) {
                perpDir.x = 1;
                perpDir.y = 0;
                perpDir.z = 0;
            }
            const sideAxis = this._hingeAxis.cross(perpDir);
            perpDir = sideAxis.cross(this._hingeAxis);
            perpDir.normalize();
            const len = 10 * hingeHalfWidth;
            const hingeRelAnchorPos0 = new Vector3(perpDir.x * len, perpDir.y * len, perpDir.z * len);
            const angleToMiddle = 0.5 * (hingeFwdAngle - hingeBckAngle);
            const hingeRelAnchorPos1 = new Matrix44().appendRotation(-angleToMiddle, new Vector3(this._hingeAxis.x, this._hingeAxis.y, this._hingeAxis.z)).transformVector(hingeRelAnchorPos0);
            const hingeHalfAngle = 0.5 * (hingeFwdAngle + hingeBckAngle);
            const allowedDistance = len * 2 * Math.sin(0.5 * hingeHalfAngle * Math.PI / 180);
            const hingePos = this._body1.getCurrState().position.add(this._hingePosRel0);
            const relPos0c = hingePos.add(hingeRelAnchorPos0.subtract(this._body0.getCurrState().position));
            const relPos1c = hingePos.add(hingeRelAnchorPos1.subtract(this._body1.getCurrState().position));
            this.maxDistanceConstraint = new JConstraintMaxDistance(this._body0, relPos0c, this._body1, relPos1c, allowedDistance);
            this._usingLimit = true;
        }
        if (this._damping <= 0) {
            this._damping = -1;
        } else {
            this._damping = Math.max(0, Math.min(1, this._damping));
        }
        this.enableController();
    }

    enableController() {
        if (this._controllerEnabled) {
            return;
        }
        this.midPointConstraint.enableConstraint();
        this.sidePointConstraints[0].enableConstraint();
        this.sidePointConstraints[1].enableConstraint();
        if (this._usingLimit && !this._broken) {
            this.maxDistanceConstraint.enableConstraint();
        }
        this._controllerEnabled = true;
        PhysicsSystem.getInstance().addController(this);
    }

    disableController() {
        if (!this._controllerEnabled) {
            return;
        }
        this.midPointConstraint.disableConstraint();
        this.sidePointConstraints[0].disableConstraint();
        this.sidePointConstraints[1].disableConstraint();
        if (this._usingLimit && !this._broken) {
            this.maxDistanceConstraint.disableConstraint();
        }
        this._controllerEnabled = false;
        PhysicsSystem.getInstance().removeController(this);
    }

    breakHinge() {
        if (this._broken) {
            return;
        }
        if (this._usingLimit) {
            this.maxDistanceConstraint.disableConstraint();
        }
        this._broken = true;
    }

    mendHinge() {
        if (!this._broken) {
            return;
        }
        if (this._usingLimit) {
            this.maxDistanceConstraint.enableConstraint();
        }
        this._broken = false;
    }

    setExtraTorque(torque) {
        this._extraTorque = torque;
    }

    isBroken() {
        return this._broken;
    }

    getHingePosRel0() {
        return this._hingePosRel0;
    }

    updateController(dt) {
        if (this._damping > 0) {
            let hingeAxis, newAngVel1, newAngVel2;
            let angRot1, angRot2, avAngRot, frac, newAngRot1, newAngRot2;
            hingeAxis = this._body1.getCurrState().rotVelocity.subtract(this._body0.getCurrState().rotVelocity);
            hingeAxis.normalize();
            angRot1 = this._body0.getCurrState().rotVelocity.dot(hingeAxis);
            angRot2 = this._body1.getCurrState().rotVelocity.dot(hingeAxis);
            avAngRot = 0.5 * (angRot1 + angRot2);
            frac = 1 - this._damping;
            newAngRot1 = avAngRot + (angRot1 - avAngRot) * frac;
            newAngRot2 = avAngRot + (angRot2 - avAngRot) * frac;
            newAngVel1 = this._body0.getCurrState().rotVelocity.add(new Vector3(hingeAxis.x * newAngRot1 - angRot1, hingeAxis.y * newAngRot1 - angRot1, hingeAxis.z * newAngRot1 - angRot1));
            newAngVel2 = this._body1.getCurrState().rotVelocity.add(new Vector3(hingeAxis.x * newAngRot2 - angRot2, hingeAxis.y * newAngRot2 - angRot2, hingeAxis.z * newAngRot2 - angRot2));
            this._body0.setAngleVelocity(newAngVel1);
            this._body1.setAngleVelocity(newAngVel2);
        }
        if (this._extraTorque !== 0) {
            let torque1 = this._body0.getCurrState().orientation.transformVector(this._hingeAxis);
            torque1 = new Vector3(torque1.x * this._extraTorque, torque1.y * this._extraTorque, torque1.z * this._extraTorque);
            this._body0.addWorldTorque(torque1);
            this._body1.addWorldTorque(new Vector3(torque1.x * -1, torque1.y * -1, torque1.z * -1));
        }
    }
}
