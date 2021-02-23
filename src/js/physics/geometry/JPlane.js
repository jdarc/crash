import RigidBody from "../physics/RigidBody";
import Vector3 from "../../math/Vector3";
import JConfig from "../JConfig";

export default class JPlane extends RigidBody {
    constructor(initNormal) {
        super();
        this._type = "PLANE";
        this._initNormal = initNormal ? new Vector3(initNormal) : new Vector3(0, 0, -1);
        this._normal = new Vector3(this._initNormal);
        this._distance = 0;
        this._movable = false;
    }

    getNormal() {
        return this._normal;
    }

    pointPlaneDistance(pt) {
        return Vector3.dot(this._normal, pt) - this._distance;
    }

    segmentIntersect(out, seg, state) {
        out.frac = 0;
        out.position = new Vector3();
        out.normal = new Vector3();

        const denom = Vector3.dot(this._normal, seg.direction);
        if (Math.abs(denom) > JConfig.NUM_TINY) {
            const t = -1 * (Vector3.dot(this._normal, seg.origin) - this._distance) / denom;
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
        this._normal = new Vector3(this._initNormal).transform(this._currState.orientation);
        this._distance = Vector3.dot(this._currState.position, this._normal);
    }
}
