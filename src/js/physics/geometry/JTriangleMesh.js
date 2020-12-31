import JMath3D from "../JMath3D";
import RigidBody from "../physics/RigidBody";
import Matrix44 from "../math/Matrix44";
import JOctree from "./JOctree";
import JTriangle from "./JTriangle";
import JAABox from "./JAABox";

export default class JTriangleMesh extends RigidBody {
    constructor(skin, initPosition, initOrientation, maxTrianglesPerCell, minCellSize) {
        super();

        this._octree = null;
        this._skinVertices = null;

        this.getCurrState().position = initPosition.clone();
        this.getCurrState().orientation = initOrientation.clone();
        this._maxTrianglesPerCell = maxTrianglesPerCell || 20;
        this._minCellSize = minCellSize || 1;

        this.setMovable(false);

        if (skin) {
            this._skinVertices = skin.vertices;
            this.createMesh(this._skinVertices, skin.indices);

            this._boundingBox = this._octree.boundingBox().clone();
            this._boundingSphere = this._boundingBox.getRadiusAboutCentre();

            const pos = this.getCurrState().position;
            const translate = new Matrix44([1, 0, 0, pos.x, 0, 1, 0, pos.y, 0, 0, 1, pos.z, 0, 0, 0, 1]);
            skin.transform = this.getCurrState().orientation.clone().append(translate);
        }

        this._type = "TRIANGLEMESH";
    }

    createMesh(vertices, triangleVertexIndices) {
        this._skinVertices = vertices;
        const vts = [];

        const position = this.getCurrState().position;
        let transform = new Matrix44([1, 0, 0, position.x, 0, 1, 0, position.y, 0, 0, 1, position.z, 0, 0, 0, 1]);
        transform = this.getCurrState().orientation.clone().append(transform);

        let i = 0, vi = 0;
        const vlen = vertices.length;
        for (; vi < vlen; vi++) {
            vts[i++] = transform.transformVector(vertices[vi]);
        }

        this._octree = new JOctree();
        this._octree.addTriangles(vts, vts.length, triangleVertexIndices, triangleVertexIndices.length);
        this._octree.buildOctree(this._maxTrianglesPerCell, this._minCellSize);

    }

    get_octree() {
        return this._octree;
    }

    segmentIntersect(out, seg, state) {
        const segBox = new JAABox();
        segBox.addSegment(seg);

        const potentialTriangles = [];
        const numTriangles = this._octree.getTrianglesIntersectingtAABox(potentialTriangles, segBox);

        let bestFrac = JMath3D.NUM_HUGE;
        for (let iTriangle = 0; iTriangle < numTriangles; iTriangle++) {
            const meshTriangle = this._octree.getTriangle(potentialTriangles[iTriangle]);
            const tri = new JTriangle(this._octree.getVertex(meshTriangle.getVertexIndex(0)), this._octree.getVertex(meshTriangle.getVertexIndex(1)), this._octree.getVertex(meshTriangle.getVertexIndex(2)));
            if (tri.segmentTriangleIntersection(out, seg)) {
                if (out.frac < bestFrac) {
                    bestFrac = out.frac;
                    out.position = seg.getPoint(bestFrac);
                    out.normal = meshTriangle.get_plane().getNormal();
                }
            }
        }
        out.frac = bestFrac;
        return bestFrac < JMath3D.NUM_HUGE;
    }

    updateState() {
        this.super.prototype.updateState.call(this);
        const vts = [];

        const position = this.getCurrState().position;
        let transform = new Matrix44([1, 0, 0, position.x, 0, 1, 0, position.y, 0, 0, 1, position.z, 0, 0, 0, 1]);
        transform = this.getCurrState().orientation.clone().append(transform);

        const skinVertices = this._skinVertices;
        for (let i = 0, j = 0; j < skinVertices.length; j++) {
            vts[i++] = transform.transformVector(skinVertices[j]);
        }

        this._octree.updateTriangles(vts);
        this._octree.buildOctree(this._maxTrianglesPerCell, this._minCellSize);
        this._boundingBox = this._octree.boundingBox().clone();
    }
}
