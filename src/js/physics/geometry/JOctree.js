import JMath3D from "../JMath3D";
import JAABox from "./JAABox";
import OctreeCell from "../data/OctreeCell";
import Vector3 from "../math/Vector3";
import JIndexedTriangle from "./JIndexedTriangle";
import JSegment from "./JSegment";
import JTriangle from "./JTriangle";

export default class JOctree {
    constructor() {
        this._testCounter = 0;
        this._cells = [];
        this._vertices = [];
        this._triangles = [];
        this._cellsToTest = [];
        this._boundingBox = new JAABox();
    }

    get_trianglesData() {
        return this._triangles;
    }

    getTriangle(iTriangle) {
        return this._triangles[iTriangle];
    }

    get_verticesData() {
        return this._vertices;
    }

    getVertex(iVertex) {
        return this._vertices[iVertex];
    }

    boundingBox() {
        return this._boundingBox;
    }

    clear() {
        this._cells.length = 0;
        this._vertices.length = 0;
        this._triangles.length = 0;
    }

    addTriangles(vertices, numVertices, triangleVertexIndices, numTriangles) {
        this.clear();
        this._vertices = vertices.concat();
        for (let i = 0; i < triangleVertexIndices.length; i++) {
            const tri = triangleVertexIndices[i];
            const i0 = tri.i0;
            const i1 = tri.i1;
            const i2 = tri.i2;
            const dr1 = vertices[i1].subtract(vertices[i0]);
            const dr2 = vertices[i2].subtract(vertices[i0]);
            const N = dr1.cross(dr2);
            const NLen = N.getLength();
            if (NLen > JMath3D.NUM_TINY) {
                const indexedTriangle = new JIndexedTriangle();
                indexedTriangle.setVertexIndices(i0, i1, i2, this._vertices);
                this._triangles.push(indexedTriangle);
            }
        }
    }

    buildOctree(maxTrianglesPerCell, minCellSize) {
        let i;
        this._boundingBox.clear();

        let _vertices_i = 0;
        const _vertices_l = this._vertices.length;
        let vt;
        for (; (_vertices_i < _vertices_l) && (vt = this._vertices[_vertices_i]); _vertices_i++) {
            this._boundingBox.addPoint(vt);
        }

        this._cells.length = 0;
        this._cells.push(new OctreeCell(this._boundingBox));

        let numTriangles = this._triangles.length;
        for (i = 0; i < numTriangles; i++) {
            this._cells[0].triangleIndices[i] = i;
        }

        const cellsToProcess = [];
        cellsToProcess.push(0);

        while (cellsToProcess.length !== 0) {
            const cellIndex = cellsToProcess.pop();
            if (this._cells[cellIndex].triangleIndices.length <= maxTrianglesPerCell || this._cells[cellIndex].Aabox.getRadiusAboutCentre() < minCellSize) {
                continue;
            }
            for (i = 0; i < OctreeCell.NUM_CHILDREN; i++) {
                this._cells[cellIndex].childCellIndices[i] = this._cells.length;
                cellsToProcess.push(this._cells.length);
                this._cells.push(new OctreeCell(this.createAABox(this._cells[cellIndex].Aabox, i)));

                const childCell = this._cells[this._cells.length - 1];
                numTriangles = this._cells[cellIndex].triangleIndices.length;
                for (let j = 0; j < numTriangles; j++) {
                    const iTri = this._cells[cellIndex].triangleIndices[j];
                    if (this.doesTriangleIntersectCell(this._triangles[iTri], childCell)) {
                        childCell.triangleIndices.push(iTri);
                    }
                }
            }
            this._cells[cellIndex].triangleIndices.length = 0;
        }

    }

    updateTriangles(vertices) {
        this._vertices = vertices.concat();
        let triangle;
        for (let _triangles_i = 0; (_triangles_i < this._triangles.length) && (triangle = this._triangles[_triangles_i]); _triangles_i++) {
            triangle.updateVertexIndices(this._vertices);
        }
    }

    getTrianglesIntersectingtAABox(triangles, aabb) {
        let i;
        if (this._cells.length === 0) {
            return 0;
        }

        this._cellsToTest.length = 0;
        this._cellsToTest.push(0);

        this.incrementTestCounter();

        let cellIndex, nTris, cell, triangle;

        while (this._cellsToTest.length !== 0) {
            cellIndex = this._cellsToTest.pop();

            cell = this._cells[cellIndex];

            if (!aabb.overlapTest(cell.Aabox)) {
                continue;
            }

            if (cell.isLeaf()) {
                nTris = cell.triangleIndices.length;
                for (i = 0; i < nTris; i++) {
                    triangle = this.getTriangle(cell.triangleIndices[i]);
                    if (triangle.counter !== this._testCounter) {
                        triangle.counter = this._testCounter;
                        if (aabb.overlapTest(triangle.getBoundingBox())) {
                            triangles.push(cell.triangleIndices[i]);
                        }
                    }
                }
            } else {
                for (i = 0; i < OctreeCell.NUM_CHILDREN; i++) {
                    this._cellsToTest.push(cell.childCellIndices[i]);
                }
            }
        }
        return triangles.length;

    }

    createAABox(aabb, _id) {

        const dims = new Vector3(aabb.maxPos.subtract(aabb.minPos).x * 0.5, aabb.maxPos.subtract(aabb.minPos).y * 0.5,
            aabb.maxPos.subtract(aabb.minPos).z * 0.5);
        let offset;
        switch (_id) {
            case 0:
                offset = new Vector3(1, 1, 1);
                break;
            case 1:
                offset = new Vector3(1, 1, 0);
                break;
            case 2:
                offset = new Vector3(1, 0, 1);
                break;
            case 3:
                offset = new Vector3(1, 0, 0);
                break;
            case 4:
                offset = new Vector3(0, 1, 1);
                break;
            case 5:
                offset = new Vector3(0, 1, 0);
                break;
            case 6:
                offset = new Vector3(0, 0, 1);
                break;
            case 7:
                offset = new Vector3(0, 0, 0);
                break;
            default:
                offset = new Vector3(0, 0, 0);
                break;
        }

        const result = new JAABox();
        result.minPos = aabb.minPos.add(new Vector3(offset.x * dims.x, offset.y * dims.y, offset.z * dims.z));
        result.maxPos = result.minPos.add(dims);

        dims.scaleBy(0.00001);
        result.minPos = result.minPos.subtract(dims);
        result.maxPos = result.maxPos.add(dims);

        return result;

    }

    doesTriangleIntersectCell(triangle, cell) {

        let i;
        if (!triangle.getBoundingBox().overlapTest(cell.Aabox)) {
            return false;
        }
        if (cell.Aabox.isPointInside(this.getVertex(triangle.getVertexIndex(0))) ||
            cell.Aabox.isPointInside(this.getVertex(triangle.getVertexIndex(1))) ||
            cell.Aabox.isPointInside(this.getVertex(triangle.getVertexIndex(2)))) {
            return true;
        }

        const tri = new JTriangle(this.getVertex(triangle.getVertexIndex(0)), this.getVertex(triangle.getVertexIndex(1)),
            this.getVertex(triangle.getVertexIndex(2)));
        let edge;
        let seg;
        const edges = cell.get_egdes();
        const pts = cell.get_points();
        for (i = 0; i < 12; i++) {
            edge = edges[i];
            seg = new JSegment(pts[edge.ind0], pts[edge.ind1].subtract(pts[edge.ind0]));
            if (tri.segmentTriangleIntersection(null, seg)) {
                return true;
            }
        }

        let pt0;
        let pt1;
        for (i = 0; i < 3; i++) {
            pt0 = tri.getVertex(i);
            pt1 = tri.getVertex((i + 1) % 3);
            if (cell.Aabox.segmentAABoxOverlap(new JSegment(pt0, pt1.subtract(pt0)))) {
                return true;
            }
        }
        return false;

    }

    incrementTestCounter() {
        ++this._testCounter;
        if (this._testCounter === 0) {
            const numTriangles = this._triangles.length;
            for (let i = 0; i < numTriangles; i++) {
                this._triangles[i].counter = 0;
            }
            this._testCounter = 1;
        }
    }
}
