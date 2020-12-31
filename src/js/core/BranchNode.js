import Matrix44 from "./Matrix44";
import AABox from "./AABox";
import NullNode from "./NullNode";

export default class BranchNode {
    constructor(transform) {
        this._parent = NullNode;
        this._localTransform = new Matrix44().identity();
        this._worldTransform = new Matrix44().identity();
        this._worldBounds = new AABox();
        this._childNodes = [];
        this._localTransform.copy(transform || new Matrix44().identity());
    }

    detachFromParent() {
        const oldParent = this._parent;
        this._parent = NullNode;
        oldParent.childDetached(this);
    }

    addChild(node) {
        if (!node.parentIs(this)) {
            node.attachToParent(this);
        }
        return this;
    }

    addChildren(children) {
        const length = children.length;
        let i = 0;
        for (; i < length; ++i) {
            this.addChild(children[i]);
        }
        return this;
    }

    removeChild(node) {
        if (node.parentIs(this)) {
            node.detachFromParent();
            return true;
        }
        return false;
    }

    parentIs(node) {
        return this._parent === node;
    }

    attachToParent(node) {
        this.detachFromParent();
        this._parent = node;
        this._parent.childAttached(this);
    }

    childAttached(node) {
        this._childNodes.push(node);
    }

    childDetached(node) {
        if (node) {
            const index = this._childNodes.indexOf(node);
            this._childNodes.splice(index, 1);
        }
    }

    setLocalTransform(transform) {
        this._localTransform.copy(transform);
    }

    traverseUp(visitor) {
        for (let i = this._childNodes.length; i;) {
            this._childNodes[--i].traverseUp(visitor);
        }
        visitor(this);
    }

    traverseDown(visitor) {
        if (visitor(this)) {
            for (let i = this._childNodes.length; i;) {
                this._childNodes[--i].traverseDown(visitor);
            }
        }
    }

    update() {
    }

    updateTransform() {
        this._parent.concatParentTransform(this._localTransform, this._worldTransform);
    }

    concatParentTransform(source, result) {
        result.multiply(this._worldTransform, source);
    }

    updateBounds() {
        this._worldBounds.reset();
        for (let i = this._childNodes.length; i;) {
            this._childNodes[--i].aggregateWorldBoundsInto(this._worldBounds);
        }
    }

    aggregateWorldBoundsInto(other) {
        this._worldBounds.aggregateInto(other);
    }

    render(visualizer) {
    }

    isContainedBy(container) {
        return container.contains(this._worldBounds);
    }
}
