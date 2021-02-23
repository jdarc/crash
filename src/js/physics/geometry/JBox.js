import RigidBody from "../physics/RigidBody";
import Matrix4 from "../../math/Matrix4";
import Vector3 from "../../math/Vector3";
import JConfig from "../JConfig";
import EdgeData from "../data/EdgeData";
import SpanData from "../data/SpanData";

export default class JBox extends RigidBody {
    constructor(width, depth, height) {
        super();
        this._edges = [
            new EdgeData(0, 1), new EdgeData(0, 2), new EdgeData(0, 6),
            new EdgeData(2, 3), new EdgeData(2, 4), new EdgeData(6, 7),
            new EdgeData(6, 4), new EdgeData(1, 3), new EdgeData(1, 7),
            new EdgeData(3, 5), new EdgeData(7, 5), new EdgeData(4, 5)
        ];
        this._type = "BOX";
        this._sideLengths = new Vector3(width, height, depth);
        this._halfSideLength = new Vector3;
        this._boundingSphere = 0.5 * this._sideLengths.length;
        this._points = [];
        this._cornerPoints = [];
        this.initPoint();
        this.setMass(1);
        this.updateBoundingBox();
    }

    initPoint() {
        const halfSide = this.getHalfSideLengths();
        this._points = [];
        this._points[0] = new Vector3(halfSide.x, -halfSide.y, halfSide.z);
        this._points[1] = new Vector3(halfSide.x, halfSide.y, halfSide.z);
        this._points[2] = new Vector3(-halfSide.x, -halfSide.y, halfSide.z);
        this._points[3] = new Vector3(-halfSide.x, halfSide.y, halfSide.z);
        this._points[4] = new Vector3(-halfSide.x, -halfSide.y, -halfSide.z);
        this._points[5] = new Vector3(-halfSide.x, halfSide.y, -halfSide.z);
        this._points[6] = new Vector3(halfSide.x, -halfSide.y, -halfSide.z);
        this._points[7] = new Vector3(halfSide.x, halfSide.y, -halfSide.z);

        this._cornerPoints[0] = new Vector3;
        this._cornerPoints[1] = new Vector3;
        this._cornerPoints[2] = new Vector3;
        this._cornerPoints[3] = new Vector3;
        this._cornerPoints[4] = new Vector3;
        this._cornerPoints[5] = new Vector3;
        this._cornerPoints[6] = new Vector3;
        this._cornerPoints[7] = new Vector3;
    }

    setSideLengths(size) {
        this._sideLengths.copy(size);
        this._boundingSphere = 0.5 * this._sideLengths.length;
        this.initPoint();
        this.setInertia(this.getInertiaProperties(this.getMass()));
        this.setActive();
        this.updateBoundingBox();
    }

    getSideLengths() {
        return this._sideLengths;
    }

    getEdges() {
        return this._edges;
    }

    getHalfSideLengths() {
        this._halfSideLength.setTo(this._sideLengths.x * 0.5, this._sideLengths.y * 0.5, this._sideLengths.z * 0.5);
        return this._halfSideLength;
    }

    getSpan(axis) {
        const cols = this.getCurrState().getOrientationCols();
        const s = Math.abs(Vector3.dot(axis, cols[0])) * (0.5 * this._sideLengths.x);
        const u = Math.abs(Vector3.dot(axis, cols[1])) * (0.5 * this._sideLengths.y);
        const d = Math.abs(Vector3.dot(axis, cols[2])) * (0.5 * this._sideLengths.z);
        const r = s + u + d;
        const p = Vector3.dot(this.getCurrState().position, axis);
        const obj = new SpanData();
        obj.min = p - r;
        obj.max = p + r;
        return obj;
    }

    getCornerPoints(state) {
        const x = state.position.x;
        const y = state.position.y;
        const z = state.position.z;
        const data = state.orientation.data;
        const dest0 = data[0] + x * data[12];
        const dest1 = data[1] + x * data[13];
        const dest2 = data[2] + x * data[14];
        const dest3 = data[3] + x * data[15];
        const dest4 = data[4] + y * data[12];
        const dest5 = data[5] + y * data[13];
        const dest6 = data[6] + y * data[14];
        const dest7 = data[7] + y * data[15];
        const dest8 = data[8] + z * data[12];
        const dest9 = data[9] + z * data[13];
        const dest10 = data[10] + z * data[14];
        const dest11 = data[11] + z * data[15];
        let i = 0;
        const len = this._points.length;
        for (; i < len; ++i) {
            const vx = this._points[i].x;
            const vy = this._points[i].y;
            const vz = this._points[i].z;
            this._cornerPoints[i].setTo(dest0 * vx + dest1 * vy + dest2 * vz + dest3,
                dest4 * vx + dest5 * vy + dest6 * vz + dest7,
                dest8 * vx + dest9 * vy + dest10 * vz + dest11);
        }
        return this._cornerPoints;
    }

    getCornerPointsInBoxSpace(thisState, boxState) {
        const max = new Matrix4(boxState.orientation).transpose();
        const pos = thisState.position.minus(boxState.position).transform(max);

        const orient = new Matrix4(thisState.orientation).concatenate(max);
        let transform = new Matrix4([ 1, 0, 0, pos.x, 0, 1, 0, pos.y, 0, 0, 1, pos.z, 0, 0, 0, 1 ]);
        transform = new Matrix4(orient).concatenate(transform);

        const arr = new Array(this._points.length);
        let i = 0;
        const len = this._points.length;
        for (; i < len; ++i) {
            arr[i] = new Vector3(this._points[i]).transform(transform);
        }
        return arr;
    }

    getSqDistanceToPoint(state, closestBoxPoint, point) {
        let _closestBoxPoint, halfSideLengths;
        let delta = 0, sqDistance = 0;

        _closestBoxPoint = point.minus(state.position);

        const mat = new Matrix4(state.orientation).transpose();
        _closestBoxPoint = new Vector3(_closestBoxPoint).transform(mat);

        halfSideLengths = this.getHalfSideLengths();

        if (_closestBoxPoint.x < -halfSideLengths.x) {
            delta = _closestBoxPoint.x + halfSideLengths.x;
            sqDistance += delta * delta;
            _closestBoxPoint.x = -halfSideLengths.x;
        } else if (_closestBoxPoint.x > halfSideLengths.x) {
            delta = _closestBoxPoint.x - halfSideLengths.x;
            sqDistance += delta * delta;
            _closestBoxPoint.x = halfSideLengths.x;
        }

        if (_closestBoxPoint.y < -halfSideLengths.y) {
            delta = _closestBoxPoint.y + halfSideLengths.y;
            sqDistance += delta * delta;
            _closestBoxPoint.y = -halfSideLengths.y;
        } else if (_closestBoxPoint.y > halfSideLengths.y) {
            delta = _closestBoxPoint.y - halfSideLengths.y;
            sqDistance += delta * delta;
            _closestBoxPoint.y = halfSideLengths.y;
        }

        if (_closestBoxPoint.z < -halfSideLengths.z) {
            delta = _closestBoxPoint.z + halfSideLengths.z;
            sqDistance += delta * delta;
            _closestBoxPoint.z = -halfSideLengths.z;
        } else if (_closestBoxPoint.z > halfSideLengths.z) {
            delta = _closestBoxPoint.z - halfSideLengths.z;
            sqDistance += delta * delta;
            _closestBoxPoint.z = halfSideLengths.z;
        }
        _closestBoxPoint = _closestBoxPoint.transform(state.orientation);
        closestBoxPoint[0] = state.position.plus(_closestBoxPoint);
        return sqDistance;

    }

    getDistanceToPoint(state, closestBoxPoint, point) {
        return Math.sqrt(this.getSqDistanceToPoint(state, closestBoxPoint, point));
    }

    segmentIntersect(out, seg, state) {
        let dir;
        out.frac = 0;
        out.position = new Vector3();
        out.normal = new Vector3();
        let dirMin = 0;
        let dirMax = 0;
        let frac = JConfig.NUM_HUGE;
        let min = -JConfig.NUM_HUGE;
        let max = JConfig.NUM_HUGE;
        const p = state.position.minus(seg.origin);
        const h = new Vector3(this._sideLengths.x * 0.5, this._sideLengths.y * 0.5, this._sideLengths.z * 0.5);
        const orientationCol = state.getOrientationCols();
        const directionVectorArray = [ h.x, h.y, h.z ];
        for (dir = 0; dir < 3; dir++) {
            const directionVectorNumber = directionVectorArray[dir];
            const e = Vector3.dot(orientationCol[dir], p);
            const f = Vector3.dot(orientationCol[dir], seg.direction);
            if (Math.abs(f) > JConfig.NUM_TINY) {
                let t1 = (e + directionVectorNumber) / f;
                let t2 = (e - directionVectorNumber) / f;
                if (t1 > t2) {
                    const t = t1;
                    t1 = t2;
                    t2 = t;
                }
                if (t1 > min) {
                    min = t1;
                    dirMin = dir;
                }
                if (t2 < max) {
                    max = t2;
                    dirMax = dir;
                }
                if (min > max) {
                    return false;
                }
                if (max < 0) {
                    return false;
                }
            } else if (-e - directionVectorNumber > 0 || -e + directionVectorNumber < 0) {
                return false;
            }
        }

        if (min > 0) {
            dir = dirMin;
            frac = min;
        } else {
            dir = dirMax;
            frac = max;
        }
        if (frac < 0) {
            frac = 0;
        }

        if (frac > 1 - JConfig.NUM_TINY) {
            return false;
        }
        out.frac = frac;
        out.position = seg.getPoint(frac);
        if (Vector3.dot(orientationCol[dir], seg.direction) < 0) {
            out.normal = new Vector3(orientationCol[dir].x * -1,
                orientationCol[dir].y * -1,
                orientationCol[dir].z * -1);
        } else {
            out.normal = orientationCol[dir];
        }
        return true;
    }

    getInertiaProperties(m) {
        const m12 = m / 12;
        const x = this._sideLengths.x;
        const y = this._sideLengths.y;
        const z = this._sideLengths.z;
        return new Matrix4([ m12 * (y * y + z * z), 0, 0, 0, 0, m12 * (x * x + z * z), 0, 0, 0, 0, m12 * (x * x + y * y), 0, 0, 0, 0, 1 ])
    }

    updateBoundingBox() {
        this._boundingBox.clear();
        this._boundingBox.addBox(this);
    }
}

