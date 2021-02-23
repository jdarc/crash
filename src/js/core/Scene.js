export default function(root) {
    return {
        update(seconds) {
            root.traverseDown(node => node.update(seconds) || node.updateTransform() || true);
        },
        render(renderer) {
            root.traverseDown(node => node.render(renderer) || true);
        }
    }
}
