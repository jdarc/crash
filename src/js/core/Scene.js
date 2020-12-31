import Containment from "./Containment";

export default class Scene {
    constructor(root) {
        this._root = root;
        this._seconds = 0;
    }

    update(seconds) {
        this._seconds = seconds;
        this._root.traverseDown(node => node.update(this._seconds) || node.updateTransform() || true);
        this._root.traverseUp(node => node.updateBounds() || true);
    }

    render(renderer) {
        this._root.traverseDown(node => {
            if (node.isContainedBy(renderer) !== Containment.Outside) {
                node.render(renderer);
                return true;
            }
            return false;
        });
    }
}



