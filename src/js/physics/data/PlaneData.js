import JMath3D from "../JMath3D";
import Vector3 from "../math/Vector3";

export default class PlaneData {
    constructor(pos, nor) {
        this._position = pos ? pos.clone() : new Vector3(0, 0, 0);
        this._normal = nor ? nor.clone() : new Vector3(0, 1, 0);
        this._distance = this._position.dot(this._normal);
    }

    get_position() {
        return this._position;
    }

    getNormal() {
        return this._normal;
    }

    getDistance() {
        return this._distance;
    }

    pointPlaneDistance(pt) {
        return this._normal.dot(pt) - this._distance;
    }

    setWithNormal(pos, nor) {
        this._position.copy(pos);
        this._normal.copy(nor);
        this._distance = this._position.dot(this._normal);
    }

    setWithPoint(pos0, pos1, pos2) {
        this._position = pos0.clone();
        const dr1 = pos1.subtract(pos0);
        const dr2 = pos2.subtract(pos0);
        this._normal = dr1.cross(dr2);
        const nLen = this._normal.getLength();
        if (nLen < JMath3D.NUM_TINY) {
            this._normal = new Vector3(0, 1, 0);
            this._distance = 0;
        } else {
            this._normal.scaleBy(1 / nLen);
            this._distance = pos0.dot(this._normal);
        }
    }
}
