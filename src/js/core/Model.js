import Material from "./Material";
import AABox from "./AABox";

export default (meshBuckets, materials) => {
    const parts = [], localBounds = new AABox();
    let totalVertexCount = 0, totalTriangleCount = 0;
    for (let key in meshBuckets) {
        if (meshBuckets.hasOwnProperty(key)) {
            const mesh = meshBuckets[key];
            mesh.computeLocalBounds(localBounds);
            mesh.material = materials[key] || Material.DEFAULT;
            totalVertexCount += mesh.vertexCount;
            totalTriangleCount += mesh.triangleCount;
            parts.push(mesh);
        }
    }
    return {
        getVertexCount: function() {
            return totalVertexCount;
        },
        getTriangleCount: function() {
            return totalTriangleCount;
        },
        localToWorldBounds: function(transform, result) {
            localBounds.transformInto(result, transform);
        },
        render: function(renderer) {
            const numberParts = parts.length;
            let i = 0;
            for (; i < numberParts; ++i) {
                const part = parts[i];
                part.render(renderer, part.material);
            }
        }
    }
};
