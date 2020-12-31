import Containment from "./Containment";

export default new class {
    constructor() {
    }

    parentIs() {
        return false;
    }

    attachToParent() {
    }

    childAttached(node) {
    }

    detachFromParent() {
    }

    childDetached(node) {
    }

    setLocalTransform() {
    }

    traverseUp() {
    }

    traverseDown() {
    }

    update() {
    }

    updateTransform() {
    }

    concatParentTransform(source, result) {
        result.copy(source);
    }

    updateBounds() {
    }

    aggregateWorldBoundsInto() {
    }

    render() {
    }

    isContainedBy() {
        return Containment.Inside;
    }
};
