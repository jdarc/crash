import RigidBody from "../physics/RigidBody";
import Vector3 from "../math/Vector3";
import JMath3D from "../JMath3D";

export default class JPlane extends RigidBody {
    constructor(initNormal) {
        super();
        this._type = "PLANE";
        this._initNormal = initNormal ? initNormal.clone() : new Vector3(0, 0, -1);
        this._normal = this._initNormal.clone();
        this._distance = 0;
        this._movable = false;
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

    segmentIntersect(out, seg, state) {
        out.frac = 0;
        out.position = new Vector3();
        out.normal = new Vector3();

        const denom = this._normal.dot(seg.delta);
        if (Math.abs(denom) > JMath3D.NUM_TINY) {
            const t = -1 * (this._normal.dot(seg.origin) - this._distance) / denom;
            if (t < 0 || t > 1) {
                return false;
            } else {
                out.frac = t;
                out.position = seg.getPoint(t);
                out.normal.copy(this._normal);
                out.normal.normalize();
                return true;
            }
        } else {
            return false;
        }
    }

    updateState() {
        RigidBody.prototype.updateState.call(this);
        this._normal = this._currState.orientation.transformVector(this._initNormal);
        this._distance = this._currState.position.dot(this._normal);
    }
}
