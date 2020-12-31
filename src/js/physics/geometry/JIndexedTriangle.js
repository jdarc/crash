import JAABox from "./JAABox";
import PlaneData from "../data/PlaneData";

export default class JIndexedTriangle {
    constructor() {
        this.counter = 0;
        this._vertexIndices = [];
        this._vertexIndices[0] = -1;
        this._vertexIndices[1] = -1;
        this._vertexIndices[2] = -1;
        this._plane = new PlaneData();
        this._boundingBox = new JAABox();
    }

    setVertexIndices(i0, i1, i2, vertexArray) {
        this._vertexIndices[0] = i0;
        this._vertexIndices[1] = i1;
        this._vertexIndices[2] = i2;
        this._plane.setWithPoint(vertexArray[i0], vertexArray[i1], vertexArray[i2]);
        this._boundingBox.clear();
        this._boundingBox.addPoint(vertexArray[i0]);
        this._boundingBox.addPoint(vertexArray[i1]);
        this._boundingBox.addPoint(vertexArray[i2]);

    }

    updateVertexIndices(vertexArray) {
        const i0 = this._vertexIndices[0];
        const i1 = this._vertexIndices[1];
        const i2 = this._vertexIndices[2];
        this._plane.setWithPoint(vertexArray[i0], vertexArray[i1], vertexArray[i2]);
        this._boundingBox.clear();
        this._boundingBox.addPoint(vertexArray[i0]);
        this._boundingBox.addPoint(vertexArray[i1]);
        this._boundingBox.addPoint(vertexArray[i2]);
    }

    get_vertexIndices() {
        return this._vertexIndices;
    }

    getVertexIndex(iCorner) {
        return this._vertexIndices[iCorner];
    }

    get_plane() {
        return this._plane;
    }

    getBoundingBox() {
        return this._boundingBox;
    }
}
