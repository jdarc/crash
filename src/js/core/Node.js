import Matrix4 from "../math/Matrix4";

export default class Node {
    constructor(transform = new Matrix4(), geometry = null) {
        this._localTransform = transform;
        this._geometry = geometry;
        this._parent = null;
        this._childNodes = [];
        this._worldTransform = new Matrix4();
    }

    addChild(node) {
        if (node._parent === this) return this;
        node._parent && node._parent._childNodes.splice(node._parent._childNodes.indexOf(node), 1);
        node._parent = this;
        node._parent._childNodes.push(node);
        return this;
    }

    addChildren(children) {
        for (const item of children) this.addChild(item);
        return this;
    }

    setLocalTransform(transform) {
        this._localTransform.copy(transform);
    }

    traverseDown(visitor) {
        if (visitor(this)) for (const item of this._childNodes) item.traverseDown(visitor);
    }

    updateTransform() {
        this._parent && this._worldTransform.multiply(this._parent._worldTransform, this._localTransform);
    }

    update() {
    }

    render(visualizer) {
        visualizer.world(this._worldTransform.data);
        this._geometry && this._geometry.render(visualizer);
    }
}
