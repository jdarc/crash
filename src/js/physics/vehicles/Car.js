import JChassis from "./Chassis";
import JWheel from "./Wheel";
import PhysicsSystem from "../physics/PhysicsSystem";
import Vector3 from "../math/Vector3";

export default class JCar {
    constructor(skin) {
        this._chassis = new JChassis(this, skin);
        this._wheels = [];
        this._steerRate = 0;
        this._maxSteerAngle = 0;
        this._driveTorque = 0;
        this._destSteering = 0;
        this._destAccelerate = 0;
        this._steering = 0;
        this._accelerate = 0;
        this._HBrake = 0;
        this._maxSteerAngle = 45;
        this._steerRate = 1;
        this._driveTorque = 500;
    }

    setCar(maxSteerAngle, steerRate, driveTorque) {
        this._maxSteerAngle = maxSteerAngle || 45;
        this._steerRate = steerRate || 1;
        this._driveTorque = driveTorque || 500;
    }

    setupWheel(_name, pos, wheelSideFriction, wheelFwdFriction, wheelTravel, wheelRadius, wheelRestingFrac, wheelDampingFrac, wheelNumRays) {
        if (wheelSideFriction == null) {
            wheelSideFriction = 2;
        }
        if (wheelFwdFriction == null) {
            wheelFwdFriction = 2;
        }
        if (wheelTravel == null) {
            wheelTravel = 3;
        }
        if (wheelRadius == null) {
            wheelRadius = 10;
        }
        if (wheelRestingFrac == null) {
            wheelRestingFrac = 0.5;
        }
        if (wheelDampingFrac == null) {
            wheelDampingFrac = 0.5;
        }
        if (wheelNumRays == null) {
            wheelNumRays = 1;
        }

        const mass = this._chassis.getMass();
        const mass4 = 0.25 * mass;

        const gravity = PhysicsSystem.getInstance().getGravity().clone();
        const gravityLen = gravity.getLength();
        gravity.normalize();
        const axis = new Vector3(gravity.x * -1, gravity.y * -1, gravity.z * -1);
        const spring = mass4 * gravityLen / (wheelRestingFrac * wheelTravel);
        const wheelMass = 0.03 * mass;
        const inertia = 0.5 * wheelRadius * wheelRadius * wheelMass;
        let damping = 2 * Math.sqrt(spring * mass);
        damping *= (0.25 * wheelDampingFrac);

        this._wheels[_name] = new JWheel(this);
        this._wheels[_name].setup(pos,
            axis,
            spring,
            wheelTravel,
            inertia,
            wheelRadius,
            wheelSideFriction,
            wheelFwdFriction,
            damping,
            wheelNumRays);
    }

    getChassis() {
        return this._chassis;
    }

    getWheels() {
        return this._wheels;
    }

    setAccelerate(val) {
        this._destAccelerate = val;
    }

    setSteer(val) {
        this._destSteering = val;
    }

    findWheel(_name) {
        for (let i in this._wheels) {
            if (i === _name) {
                return true;
            }
        }
        return false;
    }

    setHBrake(val) {
        this._HBrake = val;
    }

    addExternalForces(dt) {
        let i = 0;
        const len = this._wheels.length;
        for (; i < len; i++) {
            this._wheels[i].addForcesToCar(dt);
        }
    }

    postPhysics(dt) {
        const wheels = this._wheels;
        let wi, wlen;
        for (wi = 0, wlen = wheels.length; wi < wlen; ++wi) {
            wheels[wi].update(dt);
        }


        const deltaAccelerate = dt * 4;
        const deltaSteering = dt * this._steerRate;


        let dAccelerate = this._destAccelerate - this._accelerate;
        if (dAccelerate < -deltaAccelerate) {
            dAccelerate = -deltaAccelerate;
        } else if (dAccelerate > deltaAccelerate) {
            dAccelerate = deltaAccelerate;
        }
        this._accelerate += dAccelerate;

        let dSteering = this._destSteering - this._steering;
        if (dSteering < -deltaSteering) {
            dSteering = -deltaSteering;
        } else if (dSteering > deltaSteering) {
            dSteering = deltaSteering;
        }
        this._steering += dSteering;


        const maxTorque = this._driveTorque;
        wheels[JCar.WHEEL_FL].addTorque(maxTorque * this._accelerate);
        wheels[JCar.WHEEL_FR].addTorque(maxTorque * this._accelerate);
        wheels[JCar.WHEEL_BL].addTorque(maxTorque * this._accelerate);
        wheels[JCar.WHEEL_BR].addTorque(maxTorque * this._accelerate);

        wheels[JCar.WHEEL_BL].setLock(this._HBrake > 0.5);
        wheels[JCar.WHEEL_BR].setLock(this._HBrake > 0.5);


        const alpha = Math.abs(this._maxSteerAngle * this._steering);
        const angleSgn = this._steering < 0 ? 1 : -1;

        wheels[JCar.WHEEL_FR].setSteerAngle(angleSgn * alpha);
        wheels[JCar.WHEEL_FL].setSteerAngle(angleSgn * alpha);


    }

    getNumWheelsOnFloor() {
        const wheels = this._wheels;
        let count = 0;
        let i = 0;
        const len = wheels.length;
        for (; i < len; ++i) {
            if (wheels[i].getOnFloor()) {
                count++;
            }
        }
        return count;
    }
}

JCar.WHEEL_FL = 0;
JCar.WHEEL_FR = 1;
JCar.WHEEL_BL = 2;
JCar.WHEEL_BR = 3;

