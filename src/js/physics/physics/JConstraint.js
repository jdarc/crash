import PhysicsSystem from "./PhysicsSystem";

export default class JConstraint {
    constructor() {
        this.satisfied = null;
        this._constraintEnabled = null;
    }

    preApply(dt) {
        this.satisfied = false;
    }

    apply(dt) {
        return false;
    }

    enableConstraint() {
        if (this._constraintEnabled) {
            return;
        }

        this._constraintEnabled = true;
        PhysicsSystem.getInstance().addConstraint(this);
    }

    disableConstraint() {
        if (!this._constraintEnabled) {
            return;
        }

        this._constraintEnabled = false;
        PhysicsSystem.getInstance().removeConstraint(this);
    }

    get_constraintEnabled() {
        return this._constraintEnabled;
    }
}

