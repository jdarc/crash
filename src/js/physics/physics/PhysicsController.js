import PhysicsSystem from "./PhysicsSystem";

export default class PhysicsController {
    constructor() {
        this._controllerEnabled = false;
    }

    updateController(dt) {
    }

    enableController() {
        if (this._controllerEnabled) {
            return;
        }
        this._controllerEnabled = true;
        PhysicsSystem.getInstance().addController(this);
    }

    disableController() {
        if (!this._controllerEnabled) {
            return;
        }
        this._controllerEnabled = false;
        PhysicsSystem.getInstance().removeController(this);
    }

    get_controllerEnabled() {
        return this._controllerEnabled;
    }
}


