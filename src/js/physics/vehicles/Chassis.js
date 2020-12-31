import JBox from "../geometry/JBox";

export default class JChassis extends JBox {
    constructor(car, skin, width, depth, height) {
        super(skin, width || 40, depth || 70, height || 30);
        this._car = car;
    }

    get_car() {
        return this._car;
    }

    addExternalForces(dt) {
        this.clearForces();
        this.addGravityToExternalForce();
        this._car.addExternalForces(dt);
    }

    postPhysics(dt) {
        this._car.postPhysics(dt);
    }
}


