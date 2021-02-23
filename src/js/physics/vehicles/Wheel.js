import JConfig from "../JConfig";

import Vector3 from "../../math/Vector3";
import Ray from "../../math/Ray";
import PhysicsSystem from "../physics/PhysicsSystem";
import Matrix4 from "../../math/Matrix4";
import CollOutBodyData from "../data/CollOutBodyData";

const max = Math.max;
const min = Math.min;
const PI = Math.PI;
const cos = Math.cos;
const abs = Math.abs;

const noslipVel = 0.2;
const slipVel = 0.4;
const slipFactor = 0.7;
const smallVel = 3;

export default class JWheel {
    constructor(car) {
        this._car = null;
        this._pos = null;
        this._axisUp = null;
        this._spring = 0;
        this._travel = 0;
        this._inertia = 0;
        this._radius = 0;
        this._sideFriction = 0;
        this._fwdFriction = 0;
        this._damping = 0;
        this._numRays = 0;
        this._angVel = 0;
        this._steerAngle = 0;
        this._torque = 0;
        this._driveTorque = 0;
        this._axisAngle = 0;
        this._displacement = 0;
        this._upSpeed = 0;
        this._rotDamping = 0;
        this._locked = false;
        this._lastDisplacement = 0;
        this._lastOnFloor = false;
        this._angVelForGrip = 0;
        this.worldPos = null;
        this.worldAxis = null;
        this.wheelFwd = null;
        this.wheelUp = null;
        this.wheelLeft = null;
        this.wheelRayEnd = new Vector3;
        this.wheelRay = null;
        this.groundUp = null;
        this.groundLeft = null;
        this.groundFwd = null;
        this.wheelPointVel = new Vector3;
        this.rimVel = new Vector3;
        this.worldVel = new Vector3;
        this.wheelCentreVel = new Vector3;
        this._collisionSystem = null;
        this._car = car;
    }

    setup(pos, axisUp, spring, travel, inertia, radius, sideFriction, fwdFriction, damping, numRays) {
        this._pos = pos;
        this._axisUp = axisUp;
        this._spring = spring || 0;
        this._travel = travel || 0;
        this._inertia = inertia || 0;
        this._radius = radius || 0;
        this._sideFriction = sideFriction || 0;
        this._fwdFriction = fwdFriction || 0;
        this._damping = damping || 0;
        this._numRays = numRays || 0;
        this.reset();
    }

    addTorque(torque) {
        this._driveTorque += torque;
    }

    setLock(lock) {
        this._locked = lock;
    }

    setSteerAngle(steer) {
        this._steerAngle = steer;
    }

    getSteerAngle() {
        return this._steerAngle;
    }

    getActualPos() {
        const x = this._axisUp.x * this._displacement;
        const y = this._axisUp.y * this._displacement;
        const z = this._axisUp.z * this._displacement;
        return this._pos.plus(new Vector3(x, y, z));
    }

    getRadius() {
        return this._radius;
    }

    getAxisAngle() {
        return this._axisAngle;
    }

    setRotationDamping(vel) {
        this._rotDamping = vel;
    }

    addForcesToCar(dt) {
        const force = new Vector3();

        this._lastDisplacement = this._displacement;
        this._displacement = 0;

        const carBody = this._car.getChassis();

        this.worldPos = new Vector3(this._pos).transform(carBody.getCurrState().orientation);
        this.worldPos = carBody.getCurrState().position.plus(this.worldPos);

        this.worldAxis = new Vector3(this._axisUp).transform(carBody.getCurrState().orientation);
        const rotationMatrix = new Matrix4().rotate(this._steerAngle, this.worldAxis);
        this.wheelFwd = new Vector3(carBody.getCurrState().getOrientationCols()[2]).transform(rotationMatrix);
        this.wheelUp = new Vector3(this.worldAxis);
        this.wheelLeft = Vector3.cross(this.wheelUp, this.wheelFwd).normalize();
        this.wheelUp = Vector3.cross(this.wheelFwd, this.wheelLeft);

        const rayLen = 2 * this._radius + this._travel;

        this.wheelRayEnd.x = this.worldPos.x - this._radius * this.worldAxis.x;
        this.wheelRayEnd.y = this.worldPos.y - this._radius * this.worldAxis.y;
        this.wheelRayEnd.z = this.worldPos.z - this._radius * this.worldAxis.z;
        const delta = new Vector3().copy(this.worldAxis).scale(-rayLen);
        this.wheelRay = new Ray(this.wheelRayEnd.minus(delta), delta);

        if (!this._collisionSystem) {
            this._collisionSystem = PhysicsSystem.getInstance().getCollisionSystem();
        }

        const maxNumRays = 32;
        const numRays = min(this._numRays, maxNumRays);

        const objArr = new Array(numRays);
        const segments = new Array(numRays);

        const deltaFwd = (2 * this._radius) / (numRays + 1);
        this._lastOnFloor = false;

        let distFwd = 0;
        let yOffset = 0;
        let bestIRay = 0;
        let collOutBodyData = null;
        for (let iRay = 0; iRay < numRays; ++iRay) {
            collOutBodyData = objArr[iRay] = new CollOutBodyData();
            distFwd = (deltaFwd + iRay * deltaFwd) - this._radius;
            yOffset = this._radius * (1 - cos(90 * (distFwd / this._radius) * PI / 180));
            const segment = segments[iRay] = this.wheelRay.clone();
            segment.origin.x += this.wheelFwd.x * distFwd + this.wheelUp.x * yOffset;
            segment.origin.y += this.wheelFwd.y * distFwd + this.wheelUp.y * yOffset;
            segment.origin.z += this.wheelFwd.z * distFwd + this.wheelUp.z * yOffset;
            if (this._collisionSystem.segmentIntersect(collOutBodyData, segment, carBody)) {
                this._lastOnFloor = true;
                if (collOutBodyData.frac < objArr[bestIRay].frac) {
                    bestIRay = iRay;
                }
            }
        }

        if (!this._lastOnFloor) {
            return false;
        }

        const frac = objArr[bestIRay].frac;
        const groundPos = objArr[bestIRay].position;
        const otherBody = objArr[bestIRay].rigidBody;

        let groundNormal = new Vector3(this.worldAxis);
        if (numRays > 1) {
            for (let iRay = 0; iRay < numRays; iRay++) {
                collOutBodyData = objArr[iRay];
                if (collOutBodyData.frac <= 1) {
                    const v = this.worldPos.minus(segments[iRay].origin.plus(segments[iRay].direction));
                    groundNormal.x += v.x * (1 - collOutBodyData.frac);
                    groundNormal.y += v.y * (1 - collOutBodyData.frac);
                    groundNormal.z += v.z * (1 - collOutBodyData.frac);
                }
            }
            groundNormal.normalize();
        } else {
            groundNormal = objArr[bestIRay].normal;
        }

        this._displacement = rayLen * (1 - frac);
        if (this._displacement < 0) {
            this._displacement = 0;
        } else if (this._displacement > this._travel) {
            this._displacement = this._travel;
        }

        let displacementForceMag = this._displacement * this._spring;
        displacementForceMag *= Vector3.dot(objArr[bestIRay].normal, this.worldAxis);

        const dampingForceMag = this._upSpeed * this._damping;
        let totalForceMag = displacementForceMag + dampingForceMag;
        if (totalForceMag < 0) {
            totalForceMag = 0;
        }

        force.x += this.worldAxis.x * totalForceMag;
        force.y += this.worldAxis.y * totalForceMag;
        force.z += this.worldAxis.z * totalForceMag;

        this.groundUp = groundNormal;
        this.groundLeft = Vector3.cross(groundNormal, this.wheelFwd).normalize();
        this.groundFwd = Vector3.cross(this.groundLeft, this.groundUp);

        const tempv = new Vector3(this._pos).transform(carBody.getCurrState().orientation);
        this.wheelPointVel = carBody.getCurrState().linVelocity.plus(Vector3.cross(carBody.getCurrState().rotVelocity, tempv));

        const ax = groundPos.x - this.worldPos.x;
        const ay = groundPos.y - this.worldPos.y;
        const az = groundPos.z - this.worldPos.z;
        this.rimVel.x = (this.wheelLeft.y * az - this.wheelLeft.z * ay) * this._angVel;
        this.rimVel.y = (this.wheelLeft.z * ax - this.wheelLeft.x * az) * this._angVel;
        this.rimVel.z = (this.wheelLeft.x * ay - this.wheelLeft.y * ax) * this._angVel;
        this.wheelPointVel.x += this.rimVel.x;
        this.wheelPointVel.y += this.rimVel.y;
        this.wheelPointVel.z += this.rimVel.z;

        if (otherBody) {
            const otherBodyState = otherBody.getCurrState();
            const oax = groundPos.x - otherBodyState.position.x;
            const oay = groundPos.y - otherBodyState.position.y;
            const oaz = groundPos.z - otherBodyState.position.z;
            const rotx = otherBodyState.rotVelocity.y * oaz - otherBodyState.rotVelocity.z * oay;
            const roty = otherBodyState.rotVelocity.z * oax - otherBodyState.rotVelocity.x * oaz;
            const rotz = otherBodyState.rotVelocity.x * oay - otherBodyState.rotVelocity.y * oax;
            this.worldVel.x = otherBodyState.linVelocity.x + rotx;
            this.worldVel.y = otherBodyState.linVelocity.y + roty;
            this.worldVel.z = otherBodyState.linVelocity.z + rotz;

            this.wheelPointVel.x -= this.worldVel.x;
            this.wheelPointVel.y -= this.worldVel.y;
            this.wheelPointVel.z -= this.worldVel.z;
        }

        let friction = this._sideFriction;
        const sideVel = Vector3.dot(this.wheelPointVel, this.groundLeft);

        if (sideVel > slipVel || sideVel < -slipVel) {
            friction *= slipFactor;
        } else if (sideVel > noslipVel || sideVel < -noslipVel) {
            friction *= 1 - (1 - slipFactor) * (abs(sideVel) - noslipVel) / (slipVel - noslipVel);
        }

        if (sideVel < 0) friction *= -1;

        if (abs(sideVel) < smallVel) friction *= abs(sideVel) / smallVel;

        const sideForce = -friction * totalForceMag;

        force.x += this.groundLeft.x * sideForce;
        force.y += this.groundLeft.y * sideForce;
        force.z += this.groundLeft.z * sideForce;

        friction = this._fwdFriction;
        const fwdVel = Vector3.dot(this.wheelPointVel, this.groundFwd);
        if (fwdVel > slipVel || fwdVel < -slipVel) {
            friction *= slipFactor;
        } else if (fwdVel > noslipVel || fwdVel < -noslipVel) {
            friction *= 1 - (1 - slipFactor) * (abs(fwdVel) - noslipVel) / (slipVel - noslipVel);
        }

        if (fwdVel < 0) friction *= -1;

        if (abs(fwdVel) < smallVel) {
            friction *= abs(fwdVel) / smallVel;
        }

        const fwdForce = -friction * totalForceMag;
        force.x += this.groundFwd.x * fwdForce;
        force.y += this.groundFwd.y * fwdForce;
        force.z += this.groundFwd.z * fwdForce;

        this.wheelCentreVel.x = carBody.getCurrState().linVelocity.x + carBody.getCurrState().rotVelocity.y * tempv.z - carBody.getCurrState().rotVelocity.z * tempv.y;
        this.wheelCentreVel.y = carBody.getCurrState().linVelocity.y + carBody.getCurrState().rotVelocity.z * tempv.x - carBody.getCurrState().rotVelocity.x * tempv.z;
        this.wheelCentreVel.z = carBody.getCurrState().linVelocity.z + carBody.getCurrState().rotVelocity.x * tempv.y - carBody.getCurrState().rotVelocity.y * tempv.x;
        this._angVelForGrip = Vector3.dot(this.wheelCentreVel, this.groundFwd) / this._radius;
        this._torque += -fwdForce * this._radius;

        carBody.addWorldForce(force, groundPos);

        if (otherBody.getMovable()) {
            const maxOtherBodyAcc = 500;
            const maxOtherBodyForce = maxOtherBodyAcc * otherBody.getMass();
            if (force.lengthSquared > maxOtherBodyForce * maxOtherBodyForce) {
                force.scale(maxOtherBodyForce / force.length);
            }
            otherBody.addWorldForce(force.scale(-1), groundPos);
        }

        return true;
    }

    update(dt) {
        if (dt <= 0) return;

        this._upSpeed = (this._displacement - this._lastDisplacement) / max(dt, JConfig.NUM_TINY);

        if (this._locked) {
            this._angVel = 0;
            this._torque = 0;
        } else {
            this._angVel += this._torque * dt / this._inertia;
            this._torque = 0;

            if (this._angVel > this._angVelForGrip && this._angVel < this._angVelForGrip ||
                this._angVel < this._angVelForGrip && this._angVel > this._angVelForGrip) {
                this._angVel = this._angVelForGrip;
            }

            this._angVel += this._driveTorque * dt / this._inertia;
            this._driveTorque = 0;

            if (this._angVel < -200) {
                this._angVel = -200;
            } else if (this._angVel > 200) {
                this._angVel = 200;
            }

            this._axisAngle += dt * this._angVel * 180 / PI;
        }
    }

    reset() {
        this._angVel = 0;
        this._steerAngle = 0;
        this._torque = 0;
        this._driveTorque = 0;
        this._axisAngle = 0;
        this._displacement = 0;
        this._upSpeed = 0;
        this._locked = false;
        this._lastDisplacement = 0;
        this._lastOnFloor = false;
        this._angVelForGrip = 0;
    }
}

