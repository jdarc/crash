import Matrix4 from "../../math/Matrix4";
import PhysicsState from "./PhysicsState";
import Vector3 from "../../math/Vector3";
import JAABox from "../geometry/JAABox";
import PhysicsSystem from "./PhysicsSystem";
import MaterialProperties from "../data/MaterialProperties";
import JConfig from "../JConfig";

// noinspection JSUnusedGlobalSymbols,DuplicatedCode
export default class RigidBody {
    constructor() {
        this._id = RigidBody.idCounter++;
        this._material = new MaterialProperties(0, 0);
        this._bodyInertia = new Matrix4();
        this._bodyInvInertia = new Matrix4();
        this._currState = new PhysicsState();
        this._oldState = new PhysicsState();
        this._storeState = new PhysicsState();
        this._currLinVelocityAux = new Vector3();
        this._currRotVelocityAux = new Vector3();
        this._force = new Vector3();
        this._torque = new Vector3();
        this._invOrientation = new Matrix4;
        this._linVelDamping = new Vector3(0.999, 0.999, 0.999);
        this._rotVelDamping = new Vector3(0.999, 0.999, 0.999);
        this._maxLinVelocities = new Vector3(JConfig.NUM_HUGE, JConfig.NUM_HUGE, JConfig.NUM_HUGE);
        this._maxRotVelocities = new Vector3(JConfig.NUM_HUGE, JConfig.NUM_HUGE, JConfig.NUM_HUGE);
        this._inactiveTime = 0;
        this._isActive = true;
        this._movable = true;
        this._origMovable = true;
        this._collisions = [];
        this._constraints = [];
        this._nonCollidables = [];
        this._storedPositionForActivation = new Vector3();
        this._bodiesToBeActivatedOnMovement = [];
        this._lastPositionForDeactivation = new Vector3(this._currState.position);
        this._lastOrientationForDeactivation = new Matrix4(this._currState.orientation);
        this._type = "Object3D";
        this._boundingSphere = JConfig.NUM_HUGE;
        this._boundingBox = new JAABox();
        this._mass = 0;
        this._invMass = 0;
        this._worldInertia = new Matrix4();
        this._worldInvInertia = new Matrix4();
        this._rotationX = 0;
        this._rotationY = 0;
        this._rotationZ = 0;
        this._gravity = new Vector3();
        this._gravityAxis = 0;
        this._gravityForce = new Vector3();
        this.collisionSystem = null;
        this.applyGravity = true;
        this._velChanged = true;
    }

    getId() {
        return this._id;
    }

    getCollisions() {
        return this._collisions;
    }

    isActive() {
        return this._isActive;
    }

    getVelChanged() {
        return this._velChanged;
    }

    clearVelChanged() {
        return this._velChanged = false;
    }

    getType() {
        return this._type;
    }

    getCurrState() {
        return this._currState;
    }

    getOldState() {
        return this._oldState;
    }

    getRotationX() {
        return this._rotationX;
    }

    getRotationY() {
        return this._rotationY;
    }

    getRotationZ() {
        return this._rotationZ;
    }

    setRotationX(px) {
        this._rotationX = px;
        this.setOrientation(this.createRotationMatrix());
    }

    setRotationY(py) {
        this._rotationY = py;
        this.setOrientation(this.createRotationMatrix());
    }

    setRotationZ(pz) {
        this._rotationZ = pz;
        this.setOrientation(this.createRotationMatrix());
    }

    pitch(rot) {
        const rotationMatrixAxis = new Matrix4().rotate(rot, new Vector3(1, 0, 0));
        this.setOrientation(new Matrix4(this.getCurrState().orientation).concatenate(rotationMatrixAxis));
    }

    yaw(rot) {
        const rotationMatrixAxis = new Matrix4().rotate(rot, new Vector3(0, 1, 0));
        this.setOrientation(new Matrix4(this.getCurrState().orientation).concatenate(rotationMatrixAxis));
    }

    roll(rot) {
        const rotationMatrixAxis = new Matrix4().rotate(rot, new Vector3(0, 0, 1));
        this.setOrientation(new Matrix4(this.getCurrState().orientation).concatenate(rotationMatrixAxis));
    }

    createRotationMatrix() {
        const mat = new Matrix4();
        mat.rotate(this._rotationX, new Vector3(1, 0, 0));
        mat.rotate(this._rotationY, new Vector3(0, 1, 0));
        mat.rotate(this._rotationZ, new Vector3(0, 0, 1));
        return mat;
    }

    setOrientation(orient) {
        this._currState.orientation.copy(orient);
        this.updateInertia();
        this.updateState();
    }

    getX() {
        return this._currState.position.x;
    }

    getY() {
        return this._currState.position.y;
    }

    getZ() {
        return this._currState.position.z;
    }

    setX(px) {
        this._currState.position.x = px;
        this.updateState();
    }

    setY(py) {
        this._currState.position.y = py;
        this.updateState();
    }

    setZ(pz) {
        this._currState.position.z = pz;
        this.updateState();
    }

    moveTo(pos) {
        this._currState.position.copy(pos);
        this.updateState();
    }

    updateState() {
        this._currState.linVelocity.setTo(0, 0, 0);
        this._currState.rotVelocity.setTo(0, 0, 0);
        this.copyCurrentStateToOld();
        this.updateBoundingBox();
    }

    setLineVelocity(vel) {
        this._currState.linVelocity.copy(vel);
    }

    setAngleVelocity(angVel) {
        this._currState.rotVelocity.copy(angVel);
    }

    setLineVelocityAux(vel) {
        this._currLinVelocityAux.copy(vel);
    }

    setAngleVelocityAux(angVel) {
        this._currRotVelocityAux.copy(angVel);
    }

    getImmovable() {
        return !this._movable;
    }

    updateGravity(gravity, gravityAxis) {
        this._gravity = gravity;
        this._gravityAxis = gravityAxis;
        this._gravityForce.setTo(gravity.x * this._mass, gravity.y * this._mass, gravity.z * this._mass);
    }

    addWorldTorque(t) {
        if (!this._movable) {
            return;
        }
        this._mVelChanged = true;
        this._torque.x += t.x;
        this._torque.y += t.y;
        this._torque.z += t.z;

        this.setActive();
    }

    addBodyTorque(t) {
        if (!this._movable) {
            return;
        }

        const mat = this._currState.orientation.data;
        this._torque.x += mat[0] * t.x + mat[1] * t.y + mat[2] * t.z + mat[3];
        this._torque.y += mat[4] * t.x + mat[5] * t.y + mat[6] * t.z + mat[7];
        this._torque.z += mat[8] * t.x + mat[9] * t.y + mat[10] * t.z + mat[11];

        this.setActive();
    }

    addWorldForce(f, p) {
        if (!this._movable) {
            return;
        }

        this._mVelChanged = true;
        this._force.x += f.x;
        this._force.y += f.y;
        this._force.z += f.z;

        const px = p.x - this._currState.position.x;
        const py = p.y - this._currState.position.y;
        const pz = p.z - this._currState.position.z;
        this._torque.x += py * f.z - pz * f.y;
        this._torque.y += pz * f.x - px * f.z;
        this._torque.z += px * f.y - py * f.x;

        this.setActive();
    }

    addBodyForce(f, p) {
        if (!this._movable) {
            return;
        }

        f.transform(this._currState.orientation);
        p.transform(this._currState.orientation);

        this.addWorldForce(f, this._currState.position.plus(p));

        this.setActive();
    }

    clearForces() {
        this._force.setTo(0, 0, 0);
        this._torque.setTo(0, 0, 0);
    }

    applyWorldImpulse(impulse, pos) {
        if (!this._movable) {
            return;
        }
        this._mVelChanged = true;
        this._currState.linVelocity.x += impulse.x * this._invMass || 0;
        this._currState.linVelocity.y += impulse.y * this._invMass || 0;
        this._currState.linVelocity.z += impulse.z * this._invMass || 0;

        const posX = pos.x - this._currState.position.x;
        const posY = pos.y - this._currState.position.y;
        const posZ = pos.z - this._currState.position.z;

        const rotImplsX = posY * impulse.z - posZ * impulse.y;
        const rotImplsY = posZ * impulse.x - posX * impulse.z;
        const rotImplsZ = posX * impulse.y - posY * impulse.x;
        const mat = this._worldInvInertia.data;
        this._currState.rotVelocity.x += mat[0] * rotImplsX + mat[1] * rotImplsY + mat[2] * rotImplsZ + mat[3] || 0;
        this._currState.rotVelocity.y += mat[4] * rotImplsX + mat[5] * rotImplsY + mat[6] * rotImplsZ + mat[7] || 0;
        this._currState.rotVelocity.z += mat[8] * rotImplsX + mat[9] * rotImplsY + mat[10] * rotImplsZ + mat[11] || 0;
    }

    applyWorldImpulseAux(impulse, pos) {
        if (!this._movable) {
            return;
        }
        this._mVelChanged = true;
        this._currLinVelocityAux.x += impulse.x * this._invMass || 0;
        this._currLinVelocityAux.y += impulse.y * this._invMass || 0;
        this._currLinVelocityAux.z += impulse.z * this._invMass || 0;

        const posX = pos.x - this._currState.position.x;
        const posY = pos.y - this._currState.position.y;
        const posZ = pos.z - this._currState.position.z;
        const rotImplsX = posY * impulse.z - posZ * impulse.y;
        const rotImplsY = posZ * impulse.x - posX * impulse.z;
        const rotImplsZ = posX * impulse.y - posY * impulse.x;
        const mat = this._worldInvInertia.data;
        this._currRotVelocityAux.x += mat[0] * rotImplsX + mat[1] * rotImplsY + mat[2] * rotImplsZ + mat[3] || 0;
        this._currRotVelocityAux.y += mat[4] * rotImplsX + mat[5] * rotImplsY + mat[6] * rotImplsZ + mat[7] || 0;
        this._currRotVelocityAux.z += mat[8] * rotImplsX + mat[9] * rotImplsY + mat[10] * rotImplsZ + mat[11] || 0;

    }

    applyBodyWorldImpulse(impulse, delta) {
        if (!this._movable) {
            return;
        }
        this._mVelChanged = true;
        this._currState.linVelocity.x += impulse.x * this._invMass || 0;
        this._currState.linVelocity.y += impulse.y * this._invMass || 0;
        this._currState.linVelocity.z += impulse.z * this._invMass || 0;

        const rotImpulseX = delta.y * impulse.z - delta.z * impulse.y || 0;
        const rotImpulseY = delta.z * impulse.x - delta.x * impulse.z || 0;
        const rotImpulseZ = delta.x * impulse.y - delta.y * impulse.x || 0;
        const mat = this._worldInvInertia.data;
        this._currState.rotVelocity.x += mat[0] * rotImpulseX + mat[1] * rotImpulseY + mat[2] * rotImpulseZ + mat[3];
        this._currState.rotVelocity.y += mat[4] * rotImpulseX + mat[5] * rotImpulseY + mat[6] * rotImpulseZ + mat[7];
        this._currState.rotVelocity.z += mat[8] * rotImpulseX + mat[9] * rotImpulseY + mat[10] * rotImpulseZ + mat[11];

    }

    applyBodyWorldImpulseAux(impulse, delta) {
        if (!this._movable) {
            return;
        }
        this._mVelChanged = true;
        this._currLinVelocityAux.x += impulse.x * this._invMass || 0;
        this._currLinVelocityAux.y += impulse.y * this._invMass || 0;
        this._currLinVelocityAux.z += impulse.z * this._invMass || 0;

        const rotImpulseX = delta.y * impulse.z - delta.z * impulse.y || 0;
        const rotImpulseY = delta.z * impulse.x - delta.x * impulse.z || 0;
        const rotImpulseZ = delta.x * impulse.y - delta.y * impulse.x || 0;
        const mat = this._worldInvInertia.data;
        this._currRotVelocityAux.x += mat[0] * rotImpulseX + mat[1] * rotImpulseY + mat[2] * rotImpulseZ + mat[3];
        this._currRotVelocityAux.y += mat[4] * rotImpulseX + mat[5] * rotImpulseY + mat[6] * rotImpulseZ + mat[7];
        this._currRotVelocityAux.z += mat[8] * rotImpulseX + mat[9] * rotImpulseY + mat[10] * rotImpulseZ + mat[11];

    }

    updateVelocity(dt) {
        if (!this._movable || !this._isActive) {
            return;
        }

        this._currState.linVelocity.x += this._force.x * this._invMass * dt || 0;
        this._currState.linVelocity.y += this._force.y * this._invMass * dt || 0;
        this._currState.linVelocity.z += this._force.z * this._invMass * dt || 0;

        const rx = this._torque.x * dt || 0;
        const ry = this._torque.y * dt || 0;
        const rz = this._torque.z * dt || 0;
        const mat = this._worldInvInertia.data;
        this._currState.rotVelocity.x += mat[0] * rx + mat[1] * ry + mat[2] * rz + mat[3];
        this._currState.rotVelocity.y += mat[4] * rx + mat[5] * ry + mat[6] * rz + mat[7];
        this._currState.rotVelocity.z += mat[8] * rx + mat[9] * ry + mat[10] * rz + mat[11];
    }

    updatePosition(dt) {
        if (!this._movable || !this._isActive) {
            return;
        }
        const angMomBefore = new Vector3(this._currState.rotVelocity).transform(this._worldInertia);
        this._currState.position.setTo(this._currState.position.plus(new Vector3(this._currState.linVelocity.x * dt,
            this._currState.linVelocity.y * dt,
            this._currState.linVelocity.z * dt)));
        const dir = new Vector3(this._currState.rotVelocity);
        let ang = dir.length;
        if (ang > 0) {
            dir.normalize();
            ang *= dt;
            const rot = new Matrix4().rotate(ang, new Vector3(dir.x, dir.y, dir.z));
            this._currState.orientation = new Matrix4().copy(this._currState.orientation).concatenate(rot);
            this.updateInertia();
        }
        angMomBefore.transform(this._worldInvInertia);
        this._currState.rotVelocity.copy(angMomBefore);
    }

    updatePositionWithAux(dt) {
        if (!this._movable || !this._isActive) {
            this._currLinVelocityAux.setTo(0, 0, 0);
            this._currRotVelocityAux.setTo(0, 0, 0);
            return;
        }

        const ga = this._gravityAxis;
        if (ga !== -1) {
            const arr = [ this._currLinVelocityAux.x, this._currLinVelocityAux.y, this._currLinVelocityAux.z ];
            arr[(ga + 1) % 3] *= 0.1;
            arr[(ga + 2) % 3] *= 0.1;
            this._currLinVelocityAux.x = arr[0];
            this._currLinVelocityAux.y = arr[1];
            this._currLinVelocityAux.z = arr[2];
        }

        this._currState.position.x += (this._currState.linVelocity.x + this._currLinVelocityAux.x) * dt;
        this._currState.position.y += (this._currState.linVelocity.y + this._currLinVelocityAux.y) * dt;
        this._currState.position.z += (this._currState.linVelocity.z + this._currLinVelocityAux.z) * dt;

        const dir = this._currState.rotVelocity.plus(this._currRotVelocityAux);
        const ang = dir.length * 180 / Math.PI;
        if (ang > 0) {
            dir.normalize();
            this._currState.orientation.rotate(ang * dt, dir);
            this.updateInertia();
        }

        this._currLinVelocityAux.setTo(0, 0, 0);
        this._currRotVelocityAux.setTo(0, 0, 0);
    }

    tryToFreeze(dt) {
        if (!this._movable || !this._isActive) {
            return;
        }

        const px = this._currState.position.x - this._lastPositionForDeactivation.x;
        const py = this._currState.position.y - this._lastPositionForDeactivation.y;
        const pz = this._currState.position.z - this._lastPositionForDeactivation.z;
        if (Math.sqrt(px * px + py * py + pz * pz) > JConfig.POS_THRESHOLD) {
            this._lastPositionForDeactivation.copy(this._currState.position);
            this._inactiveTime = 0;
            return;
        }
        const ot = JConfig.ORIENT_THRESHOLD * JConfig.ORIENT_THRESHOLD;

        const ar = this._currState.orientation.data;
        const br = this._lastOrientationForDeactivation.data;
        const col0x = ar[0] - br[0];
        const col0y = ar[4] - br[4];
        const col0z = ar[8] - br[8];
        const col1x = ar[1] - br[1];
        const col1y = ar[5] - br[5];
        const col1z = ar[9] - br[9];
        const col2x = ar[2] - br[2];
        const col2y = ar[6] - br[6];
        const col2z = ar[10] - br[10];
        if (col0x * col0x + col0y * col0y + col0z * col0z > ot ||
            col1x * col1x + col1y * col1y + col1z * col1z > ot ||
            col2x * col2x + col2y * col2y + col2z * col2z > ot) {
            this._lastOrientationForDeactivation.copy(this._currState.orientation);
            this._inactiveTime = 0;
            return;
        }
        if (this.getShouldBeActive()) {
            return;
        }
        this._inactiveTime += dt;
        if (this._inactiveTime > JConfig.DEACTIVATION_TIME) {
            this._lastPositionForDeactivation.copy(this._currState.position);
            this._lastOrientationForDeactivation.copy(this._currState.orientation);
            this.setInactive();
        }
    }

    addGravityToExternalForce() {
        if (this.applyGravity) {
            this._force.x += this._gravityForce.x;
            this._force.y += this._gravityForce.y;
            this._force.z += this._gravityForce.z;
        }
    }

    addExternalForces() {
        this.clearForces();
        this.addGravityToExternalForce();
    }

    postPhysics(dt) {
    }

    setMass(m) {
        this._mass = m;
        this._invMass = 1 / m;
        this.setInertia(this.getInertiaProperties(m));
        const physicsSystem = PhysicsSystem.getInstance();
        this.updateGravity(physicsSystem.getGravity(), physicsSystem.getMainGravityAxis());
    }

    setInertia(m) {
        this._bodyInertia.copy(m);
        this._bodyInvInertia.copy(m);
        this._bodyInvInertia.invert();
        this.updateInertia();
    }

    updateInertia() {
        this._invOrientation.copy(this._currState.orientation);
        this._invOrientation.transpose();

        this._worldInertia.copy(this._bodyInertia).concatenate(this._currState.orientation);
        this._worldInertia.copy(this._worldInertia).concatenate(this._invOrientation);

        this._worldInvInertia.copy(this._bodyInvInertia).concatenate(this._currState.orientation);
        this._worldInvInertia.copy(this._worldInvInertia).concatenate(this._invOrientation);
    }

    getMovable() {
        return this._movable;
    }

    setMovable(mov) {
        if (this._type === "PLANE" || this._type === "TERRAIN" || this._type === "TRIANGLEMESH") {
            return;
        }
        this._movable = mov;
        this._isActive = mov;
        this._origMovable = mov;
    }

    _internalSetImmovable() {
        this._origMovable = this._movable;
        this._movable = false;
    }

    internalRestoreImmovable() {
        this._movable = this._origMovable;
    }

    setActive() {
        if (this._movable) {
            if (this._isActive) {
                return;
            }
            this._inactiveTime = 0;
            this._isActive = true;
        }
    }

    setInactive() {
        if (this._movable) {
            this._inactiveTime = JConfig.DEACTIVATION_TIME;
            this._isActive = false;
        }
    }

    getVelocity(relPos) {
        return this._currState.linVelocity.plus(Vector3.cross(this._currState.rotVelocity, relPos));
    }

    getVelocityAux(relPos) {
        return this._currLinVelocityAux.plus(Vector3.cross(this._currRotVelocityAux, relPos));
    }

    getShouldBeActive() {
        return this._currState.linVelocity.length > JConfig.VEL_THRESHOLD ||
            this._currState.rotVelocity.length > JConfig.ANG_VEL_THRESHOLD;
    }

    getShouldBeActiveAux() {
        return this._currLinVelocityAux.length > JConfig.VEL_THRESHOLD ||
            this._currRotVelocityAux.length > JConfig.ANG_VEL_THRESHOLD;
    }

    dampForDeactivation() {
        this._currState.linVelocity.x *= this._linVelDamping.x;
        this._currState.linVelocity.y *= this._linVelDamping.y;
        this._currState.linVelocity.z *= this._linVelDamping.z;
        this._currState.rotVelocity.x *= this._rotVelDamping.x;
        this._currState.rotVelocity.y *= this._rotVelDamping.y;
        this._currState.rotVelocity.z *= this._rotVelDamping.z;
        this._currLinVelocityAux.x *= this._linVelDamping.x;
        this._currLinVelocityAux.y *= this._linVelDamping.y;
        this._currLinVelocityAux.z *= this._linVelDamping.z;
        this._currRotVelocityAux.x *= this._rotVelDamping.x;
        this._currRotVelocityAux.y *= this._rotVelDamping.y;
        this._currRotVelocityAux.z *= this._rotVelDamping.z;
        const r = 0.5;
        const frac = this._inactiveTime / JConfig.DEACTIVATION_TIME;
        if (frac < r) {
            return;
        }
        let scale = 1 - (frac - r) / (1 - r);
        if (scale < 0) {
            scale = 0;
        } else if (scale > 1) {
            scale = 1;
        }
        this._currState.linVelocity.scale(scale);
        this._currState.rotVelocity.scale(scale);
    }

    doMovementActivations(physicsSystem) {
        const bodiesToBeActivatedOnMovement = this._bodiesToBeActivatedOnMovement;
        if (bodiesToBeActivatedOnMovement.length === 0) {
            return;
        }
        const px = this._currState.position.x - this._storedPositionForActivation.x;
        const py = this._currState.position.y - this._storedPositionForActivation.y;
        const pz = this._currState.position.z - this._storedPositionForActivation.z;
        if (Math.sqrt(px * px + py * py + pz * pz) < JConfig.POS_THRESHOLD) {
            return;
        }
        let i = 0;
        const len = bodiesToBeActivatedOnMovement.length;
        for (; i < len; ++i) {
            physicsSystem.activateObject(bodiesToBeActivatedOnMovement[i]);
        }
        bodiesToBeActivatedOnMovement.length = 0;
    }

    addMovementActivation(pos, otherBody) {
        if (this._bodiesToBeActivatedOnMovement.indexOf(otherBody) > -1) {
            return;
        }
        if (this._bodiesToBeActivatedOnMovement.length === 0) {
            this._storedPositionForActivation = pos;
        }
        this._bodiesToBeActivatedOnMovement.push(otherBody);
    }

    setConstraintsAndCollisionsUnsatisfied() {
        let i, len;
        const constraints = this._constraints;
        for (i = 0, len = constraints.length; i < len; i++) {
            constraints[i].satisfied = false;
        }
        const collisions = this._collisions;
        for (i = 0, len = collisions.length; i < len; i++) {
            collisions[i].satisfied = false;
        }
    }

    segmentIntersect() {
        return false;
    }

    getInertiaProperties() {
        return new Matrix4();
    }

    updateBoundingBox() {
    }

    hitTestObject3D(obj3D) {
        const position = this._currState.position;
        const otherPosition = obj3D.getCurrState().position;
        const x = position.x - otherPosition.x;
        const y = position.y - otherPosition.y;
        const z = position.z - otherPosition.z;
        return Math.sqrt(x * x + y * y + z * z) <= this._boundingSphere + obj3D.getBoundingSphere();
    }

    disableCollisions(body) {
        if (this._nonCollidables.indexOf(body) < 0) {
            this._nonCollidables.push(body);
        }
    }

    enableCollisions(body) {
        if (this._nonCollidables.indexOf(body) >= 0) {
            this._nonCollidables.splice(this._nonCollidables.indexOf(body), 1);
        }
    }

    addConstraint(constraint) {
        if (this._constraints.indexOf(constraint) < 0) {
            this._constraints.push(constraint);
        }
    }

    removeConstraint(constraint) {
        if (this._constraints.indexOf(constraint) >= 0) {
            this._constraints.splice(this._constraints.indexOf(constraint), 1);
        }
    }

    copyCurrentStateToOld() {
        this._oldState.position.copy(this._currState.position);
        this._oldState.orientation.copy(this._currState.orientation);
        this._oldState.linVelocity.copy(this._currState.linVelocity);
        this._oldState.rotVelocity.copy(this._currState.rotVelocity);
    }

    storeState() {
        this._storeState.position.copy(this._currState.position);
        this._storeState.orientation.copy(this._currState.orientation);
        this._storeState.linVelocity.copy(this._currState.linVelocity);
        this._storeState.rotVelocity.copy(this._currState.rotVelocity);
    }

    restoreState() {
        this._currState.position.copy(this._storeState.position);
        this._currState.orientation.copy(this._storeState.orientation);
        this._currState.linVelocity.copy(this._storeState.linVelocity);
        this._currState.rotVelocity.copy(this._storeState.rotVelocity);
        this.updateInertia();
    }

    getBoundingSphere() {
        return this._boundingSphere;
    }

    getBoundingBox() {
        return this._boundingBox;
    }

    getForce() {
        return this._force;
    }

    getMass() {
        return this._mass;
    }

    getInvMass() {
        return this._invMass;
    }

    getWorldInertia() {
        return this._worldInertia;
    }

    getWorldInvInertia() {
        return this._worldInvInertia;
    }

    getNonCollidables() {
        return this._nonCollidables;
    }

    getConstraints() {
        return this._constraints;
    }

    setLinVelocityDamping(vel) {
        this._linVelDamping.x = Math.max(0, Math.min(1, vel.x));
        this._linVelDamping.y = Math.max(0, Math.min(1, vel.y));
        this._linVelDamping.z = Math.max(0, Math.min(1, vel.z));
    }

    getLinVelocityDamping() {
        return this._linVelDamping;
    }

    setRotVelocityDamping(vel) {
        this._rotVelDamping.x = Math.max(0, Math.min(1, vel.x));
        this._rotVelDamping.y = Math.max(0, Math.min(1, vel.y));
        this._rotVelDamping.z = Math.max(0, Math.min(1, vel.z));
    }

    getRotVelocityDamping() {
        return this._rotVelDamping;
    }

    setMaxLinVelocities(vel) {
        this._maxLinVelocities.setTo(Math.abs(vel.x), Math.abs(vel.y), Math.abs(vel.z));
    }

    getMaxLinVelocities() {
        return this._maxLinVelocities;
    }

    setMaxRotVelocities(vel) {
        this._maxRotVelocities.setTo(Math.abs(vel.x), Math.abs(vel.y), Math.abs(vel.z));
    }

    getMaxRotVelocities() {
        return this._maxRotVelocities;
    }

    limitVel() {
        const linVelocity = this._currState.linVelocity;
        const maxLinVelocities = this._maxLinVelocities;
        linVelocity.x = Math.max(-maxLinVelocities.x, Math.min(maxLinVelocities.x, linVelocity.x));
        linVelocity.y = Math.max(-maxLinVelocities.y, Math.min(maxLinVelocities.y, linVelocity.y));
        linVelocity.z = Math.max(-maxLinVelocities.z, Math.min(maxLinVelocities.z, linVelocity.z));
    }

    limitAngVel() {
        const fx = Math.abs(this._currState.rotVelocity.x) / this._maxRotVelocities.x;
        const fy = Math.abs(this._currState.rotVelocity.y) / this._maxRotVelocities.y;
        const fz = Math.abs(this._currState.rotVelocity.z) / this._maxRotVelocities.z;
        const f = Math.max(fx, fy, fz);
        if (f > 1) {
            this._currState.rotVelocity.x /= f;
            this._currState.rotVelocity.y /= f;
            this._currState.rotVelocity.z /= f;
        }
    }

    getMaterial() {
        return this._material;
    }

    getRestitution() {
        return this._material.restitution;
    }

    setRestitution(restitution) {
        this._material.restitution = Math.max(0, Math.min(1, restitution));
    }

    getFriction() {
        return this._material.staticFriction;
    }

    setFriction(friction) {
        this._material.staticFriction = Math.max(0, Math.min(1, friction));
    }
}

RigidBody.idCounter = 0;
