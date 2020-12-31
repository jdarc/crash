import Matrix44 from "./Matrix44";
import AABox from "./AABox";
import NullNode from "./NullNode";

export default class LeafNode {
    constructor(geometry, transform) {
        this._geometry = geometry;
        this._parent = NullNode;
        this._localTransform = new Matrix44().identity();
        this._worldTransform = new Matrix44().identity();
        this._worldBounds = new AABox();
        this._localTransform.copy(transform || new Matrix44().identity());
    }

    detachFromParent() {
        const oldParent = this._parent;
        this._parent = NullNode;
        oldParent.childDetached(this);
    }

    attachToParent(node) {
        this.detachFromParent();
        this._parent = node;
        this._parent.childAttached(this);
    }

    parentIs(node) {
        return this._parent === node;
    }

    childAttached() {
    }

    childDetached() {
    }

    setLocalTransform(transform) {
        this._localTransform.copy(transform);
    }

    traverseUp(visitor) {
        visitor(this);
    }

    traverseDown(visitor) {
        visitor(this);
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
        this._geometry.localToWorldBounds(this._worldTransform.data, this._worldBounds);
    }

    aggregateWorldBoundsInto(other) {
        this._worldBounds.aggregateInto(other);
    }

    render(visualizer) {
        visualizer.world(this._worldTransform.data);
        this._geometry.render(visualizer);
    }

    isContainedBy(container) {
        return container.contains(this._worldBounds);
    }
}
