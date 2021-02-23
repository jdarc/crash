import Vector3 from "../../math/Vector3";
import CollisionInfo from "../collision/CollisionInfo";
import JConfig from "../JConfig";

export default class PhysicsSystem {
    constructor() {
        this._doingIntegration = false;
        this._maxVelMag = 0.5;
        this._minVelForProcessing = 0.001;
        this._gravityAxis = null;
        this._gravity = null;
        this._bodies = [];
        this._activeBodies = [];
        this._collisions = [];
        this._collisionSystem = null;
        this.setGravity(new Vector3(new Vector3(0, -10, 0)));
    }

    setCollisionSystem(coll) {
        this._collisionSystem = coll;
    }

    getCollisionSystem() {
        return this._collisionSystem;
    }

    integrate(dt) {
        if (this._doingIntegration) {
            return;
        }

        this._doingIntegration = true;

        this._findAllActiveBodies();

        this._copyAllCurrentStatesToOld();

        this._getAllExternalForces(dt);

        this._detectAllCollisions(dt);

        this._handleAllConstraints(dt, JConfig.NUM_COLLISION_ITERATIONS, false);

        this._updateAllVelocities(dt);

        this._handleAllConstraints(dt, JConfig.NUM_CONTACT_ITERATIONS, true);

        this._dampAllActiveBodies();

        this._tryToFreezeAllObjects(dt);

        this._activateAllFrozenObjectsLeftHanging();

        this._limitAllVelocities();

        this._updateAllPositions(dt);

        const bodies = this._bodies;
        for (let i = 0; i < bodies.length; ++i) {
            const body = bodies[i];
            body._isActive && body.updateBoundingBox();
        }

        this._notifyAllPostPhysics(dt);

        this._doingIntegration = false;
    }

    setGravity(gravity) {
        this._gravity = gravity;
        if (gravity.x === gravity.y && gravity.y === gravity.z) {
            this._gravityAxis = -1;
        }
        this._gravityAxis = 0;
        if (Math.abs(gravity.y) > Math.abs(gravity.z)) {
            this._gravityAxis = 1;
        }
        const gravityArray = [ gravity.x, gravity.y, gravity.z ];
        if (Math.abs(gravity.z) > Math.abs(gravityArray[this._gravityAxis])) {
            this._gravityAxis = 2;
        }
    }

    getGravity() {
        return this._gravity;
    }

    getMainGravityAxis() {
        return this._gravityAxis;
    }

    activateObject(body) {
        if (!body.getMovable() || body._isActive) {
            return;
        }
        body.setActive();
    }

    addBody(body) {
        if (this._bodies.indexOf(body) < 0) {
            this._bodies.push(body);
            this._collisionSystem.addCollisionBody(body);
        }
    }

    removeBody(body) {
        if (this._bodies.indexOf(body) > -1) {
            this._bodies.splice(this._bodies.indexOf(body), 1);
            this._collisionSystem.removeCollisionBody(body);
        }
    }

    _findAllActiveBodies() {
        this._activeBodies.length = 0;
        let i = 0;
        const numBodies = this._bodies.length;
        for (; i < numBodies; ++i) {
            if (this._bodies[i].isActive()) {
                this._activeBodies.push(this._bodies[i]);
            }
        }
    }

    _handleAllConstraints(dt, iter, forceInelastic) {
        let origNumCollisions = this._collisions.length;

        if (forceInelastic) {
            for (let i = 0; i < origNumCollisions; ++i) {
                this._preProcessCollision((this._collisions)[i], dt);
                (this._collisions)[i].mat.restitution = 0;
                (this._collisions)[i].satisfied = false;
            }
        } else {
            for (let i = 0; i < origNumCollisions; ++i) {
                this._preProcessCollision((this._collisions)[i], dt);
            }
        }


        let dir = true;
        for (let step = 0; step < iter; ++step) {
            let gotOne = false;

            let numCollisions = this._collisions.length;
            dir = !dir;
            for (let i = dir ? 0 : numCollisions - 1; i >= 0 && i < numCollisions; dir ? ++i : --i) {
                if (!(this._collisions)[i].satisfied) {
                    if (forceInelastic) {
                        gotOne |= this._processCollision((this._collisions)[i]);
                    } else {
                        gotOne |= this._processCollision((this._collisions)[i]);
                    }
                }
            }

            this._tryToActivateAllFrozenObjects();

            numCollisions = this._collisions.length;

            if (forceInelastic) {
                for (let i = origNumCollisions; i < numCollisions; ++i) {
                    (this._collisions)[i].mat.restitution = 0;
                    (this._collisions)[i].satisfied = false;
                    this._preProcessCollision((this._collisions)[i], dt);
                }
            } else {
                for (let i = origNumCollisions; i < numCollisions; ++i) {
                    this._preProcessCollision((this._collisions)[i], dt);
                }
            }

            origNumCollisions = this._collisions.length;
            if (!gotOne) {
                break;
            }
        }
    }

    collisionNotify(collDetectInfo, dirToBody0, pointInfos, numPointInfos) {
        const info = CollisionInfo.getCollisionInfo(collDetectInfo, new Vector3(-dirToBody0.x, -dirToBody0.y, -dirToBody0.z), pointInfos, numPointInfos);
        if (collDetectInfo.body0 && collDetectInfo.body0) {
            const info = CollisionInfo.getCollisionInfo(collDetectInfo, dirToBody0, pointInfos, numPointInfos);
            this._collisions.push(info);
            collDetectInfo.body0.getCollisions().push(info);
            if (collDetectInfo.body1 && collDetectInfo.body1) {
                collDetectInfo.body1.getCollisions().push(info);
            }
        } else if (collDetectInfo.body1 && collDetectInfo.body1) {
            this._collisions.push(info);
            collDetectInfo.body1.getCollisions().push(info);
            if (collDetectInfo.body0 && collDetectInfo.body0) {
                collDetectInfo.body0.getCollisions().push(info);
            }
        } else {
            console.log("warning: collision detected with both skin bodies 0\n");
        }
    }

    _getAllExternalForces(dt) {
        const bodies = this._bodies;
        const numBodies = bodies.length;
        for (let i = 0; i < numBodies; ++i) {
            bodies[i].addExternalForces(dt);
        }
    }

    _updateAllVelocities(dt) {
        const bodies = this._bodies;
        const numBodies = bodies.length;
        for (let i = 0; i < numBodies; ++i) {
            const body = bodies[i];
            if (body.isActive() || body.getVelChanged()) {
                body.updateVelocity(dt);
            }
        }
    }

    _updateAllPositions(dt) {
        const activeBodies = this._activeBodies;
        const numBodies = activeBodies.length;
        for (let i = 0; i < numBodies; ++i) {
            activeBodies[i].updatePositionWithAux(dt);
        }
    }

    _copyAllCurrentStatesToOld() {
        const bodies = this._bodies;
        let i = 0;
        const numBodies = bodies.length;
        for (; i < numBodies; ++i) {
            const body = bodies[i];
            if (body.isActive() || body.getVelChanged()) {
                body.copyCurrentStateToOld();
            }
        }
    }

    _detectAllCollisions(dt) {
        if (!this._collisionSystem) {
            return;
        }

        const bodies = this._bodies;
        const activeBodies = this._activeBodies;
        const collisions = this._collisions;
        const numBodies = bodies.length;
        const numActiveBodies = activeBodies.length;
        let i;

        for (i = 0; i < numActiveBodies; ++i) {
            activeBodies[i].storeState();
        }

        this._updateAllVelocities(dt);
        this._updateAllPositions(dt);

        collisions.length = 0;

        for (i = 0; i < numBodies; ++i) {
            if (bodies[i]) {
                bodies[i].getCollisions().length = 0;
            }
        }

        this._collisionSystem.detectAllCollisions(activeBodies, this, JConfig.COLL_TOLL);

        const rnd = Math.random;

        const len = collisions.length;
        for (i = 1; i < len; ++i) {
            const index = rnd() * i | 0;
            const collInfo = collisions[i];
            collisions[i] = collisions[index];
            collisions[index] = collInfo;
        }

        for (i = 0; i < numActiveBodies; ++i) {
            activeBodies[i].restoreState();
        }
    }

    _notifyAllPostPhysics(dt) {
        const bodies = this._bodies;
        const numBodies = bodies.length;
        for (let i = 0; i < numBodies; ++i) {
            bodies[i].postPhysics(dt);
        }
    }

    _tryToFreezeAllObjects(dt) {
        const activeBodies = this._activeBodies;
        const numBodies = activeBodies.length;
        for (let i = 0; i < numBodies; ++i) {
            activeBodies[i].tryToFreeze(dt);
        }
    }

    _dampAllActiveBodies() {
        const activeBodies = this._activeBodies;
        const numBodies = activeBodies.length;
        for (let i = 0; i < numBodies; ++i) {
            activeBodies[i].dampForDeactivation();
        }
    }

    _tryToActivateAllFrozenObjects() {
        const bodies = this._bodies;
        let bi = 0;
        const blen = bodies.length;
        for (; bi < blen; ++bi) {
            const body = bodies[bi];
            if (!body._isActive) {
                if (body.getShouldBeActive()) {
                    this.activateObject(body);
                } else {
                    body.setLineVelocity(new Vector3());
                    body.setAngleVelocity(new Vector3());
                }
            }
        }
    }

    _activateAllFrozenObjectsLeftHanging() {
        const bodies = this._bodies;
        let i = 0;
        const numBodies = bodies.length;
        for (; i < numBodies; ++i) {
            const thisBody = bodies[i];
            if (thisBody.isActive()) {
                thisBody.doMovementActivations(this);
                const collisions = thisBody.getCollisions();
                const numCollisions = collisions.length;
                if (numCollisions > 0) {
                    for (let j = 0; j < numCollisions; ++j) {
                        const coll = collisions[j];
                        if (coll.collInfo.body1) {
                            let other_body = coll.collInfo.body0;
                            if (other_body === thisBody) {
                                other_body = coll.collInfo.body1;
                            }
                            if (!other_body.isActive()) {


                                thisBody.addMovementActivation(thisBody.getCurrState().position, other_body);
                            }
                        }
                    }
                }
            }
        }
    }

    _limitAllVelocities() {
        const activeBodies = this._activeBodies;
        const numActiveBodies = activeBodies.length;
        for (let i = 0; i < numActiveBodies; ++i) {
            activeBodies[i].limitVel();
            activeBodies[i].limitAngVel();
        }
    }

    _preProcessCollision(collision, dt) {
        collision.satisfied = false;

        const body0 = collision.collInfo.body0;
        const body1 = collision.collInfo.body1;
        const N = collision.dirToBody;

        const timescale = JConfig.NUM_PENETRATION_RELAXATION_TIME_STEPS * dt;
        let approachScale = 0;
        let ptInfo;
        let tempV;
        const allowedPenetration = JConfig.ALLOWED_PENETRATION;

        let i = 0;
        const len = collision.pointInfo.length;
        for (; i < len; ++i) {
            ptInfo = collision.pointInfo[i];

            if (!body0.getMovable()) {
                ptInfo.denominator = 0;
            } else {
                tempV = Vector3.cross(ptInfo.r0, N).transform(body0.getWorldInvInertia());
                ptInfo.denominator = body0.getInvMass() + Vector3.dot(N, Vector3.cross(tempV, ptInfo.r0));
            }

            if (body1.getMovable()) {
                tempV = Vector3.cross(ptInfo.r1, N).transform(body1.getWorldInvInertia());
                ptInfo.denominator += body1.getInvMass() + Vector3.dot(N, Vector3.cross(tempV, ptInfo.r1));
            }

            if (ptInfo.denominator < JConfig.NUM_TINY) {
                ptInfo.denominator = JConfig.NUM_TINY;
            }

            if (ptInfo.initialPenetration > allowedPenetration) {
                ptInfo.minSeparationVel = (ptInfo.initialPenetration - allowedPenetration) / timescale;
            } else {
                approachScale = -0.1 * (ptInfo.initialPenetration - allowedPenetration) / allowedPenetration;
                if (approachScale < JConfig.NUM_TINY) {
                    approachScale = JConfig.NUM_TINY;
                } else if (approachScale > 1) {
                    approachScale = 1;
                }
                const max = dt > JConfig.NUM_TINY ? dt : JConfig.NUM_TINY;
                ptInfo.minSeparationVel = approachScale * (ptInfo.initialPenetration - allowedPenetration) / max;
            }

            if (ptInfo.minSeparationVel > this._maxVelMag) {
                ptInfo.minSeparationVel = this._maxVelMag;
            }
        }
    }

    _processCollision(collision) {
        collision.satisfied = true;

        const body0 = collision.collInfo.body0;
        const body1 = collision.collInfo.body1;
        const N = collision.dirToBody;

        let T = new Vector3;
        const impulse = new Vector3;
        let gotOne = false;
        let i = 0;
        const len = collision.pointInfo.length;
        for (; i < len; ++i) {
            const ptInfo = collision.pointInfo[i];

            let normalVel = 0;

            if (body1) {
                normalVel = Vector3.dot(body0.getVelocity(ptInfo.r0).minus(body1.getVelocity(ptInfo.r1)), N);
            } else {
                normalVel = Vector3.dot(body0.getVelocity(ptInfo.r0), N);
            }

            if (normalVel > ptInfo.minSeparationVel) {
                continue;
            }

            let finalNormalVel = -collision.mat.restitution * normalVel;

            if (finalNormalVel < this._minVelForProcessing) {


                finalNormalVel = ptInfo.minSeparationVel;
            }

            const deltaVel = finalNormalVel - normalVel;
            if (deltaVel <= this._minVelForProcessing) {
                continue;
            }

            const normalImpulse = deltaVel / ptInfo.denominator;


            gotOne = true;
            impulse.copy(N).scale(normalImpulse);
            body0.applyBodyWorldImpulse(impulse, ptInfo.r0);
            body1.applyBodyWorldImpulse(impulse.scale(-1), ptInfo.r1);


            let tempV;
            let Vr_new = new Vector3(body0.getVelocity(ptInfo.r0));
            if (body1) {
                Vr_new = Vr_new.minus(body1.getVelocity(ptInfo.r1));
            }

            const vrDotN = Vector3.dot(Vr_new, N);
            const tangent_vel = Vr_new.minus(new Vector3().copy(N).scale(vrDotN));
            const tangent_speed = tangent_vel.length;

            if (tangent_speed > this._minVelForProcessing) {
                T.copy(tangent_vel).scale(-1 / tangent_speed);

                let denominator = 0;

                if (!body0.getImmovable()) {
                    tempV = Vector3.cross(ptInfo.r0, T).transform(body0.getWorldInvInertia());
                    denominator = body0.getInvMass() + Vector3.dot(T, Vector3.cross(tempV, ptInfo.r0));
                }

                if (body1 && !body1.getImmovable()) {
                    tempV = Vector3.cross(ptInfo.r1, T).transform(body1.getWorldInvInertia());
                    denominator += body1.getInvMass() + Vector3.dot(T, Vector3.cross(tempV, ptInfo.r1));
                }

                if (denominator > JConfig.NUM_TINY) {
                    const impulseToReverse = tangent_speed / denominator;

                    const impulseFromNormalImpulse = collision.mat.staticFriction * normalImpulse;
                    let frictionImpulse;
                    if (impulseToReverse < impulseFromNormalImpulse) {
                        frictionImpulse = impulseToReverse;
                    } else {
                        frictionImpulse = collision.mat.dynamicFriction * normalImpulse;
                    }

                    T = T.scale(frictionImpulse);
                    body0.applyBodyWorldImpulse(T, ptInfo.r0);
                    body1.applyBodyWorldImpulse(T.scale(-1), ptInfo.r1);
                }
            }
        }
        if (gotOne) {
            body0.setConstraintsAndCollisionsUnsatisfied();
            if (body1) body1.setConstraintsAndCollisionsUnsatisfied();
        }
        return gotOne;
    }

    static getInstance() {
        if (!PhysicsSystem._instance) {
            PhysicsSystem._instance = new PhysicsSystem();
        }
        return PhysicsSystem._instance;
    }
} 

