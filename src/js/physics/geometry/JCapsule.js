import JMath3D from "../JMath3D";
import RigidBody from "../physics/RigidBody";
import Vector3 from "../math/Vector3";
import JSegment from "./JSegment";
import Matrix44 from "../math/Matrix44";

export default class JCapsule extends RigidBody {
    constructor(skin, r, l) {
        super();
        this._type = "CAPSULE";
        this._radius = r;
        this._length = l;
        this._boundingSphere = this.getBoundingSphere(r, l);
        this.setMass(1);
        this.updateBoundingBox();
    }

    set_radius(r) {
        this._radius = r;
        this._boundingSphere = this.getBoundingSphere(this._radius, this._length);
        this.setInertia(this.getInertiaProperties(this.getMass()));
        this.updateBoundingBox();
        this.setActive();
    }

    get_radius() {
        return this._radius;
    }

    set_length(l) {
        this._length = l;
        this._boundingSphere = this.getBoundingSphere(this._radius, this._length);
        this.setInertia(this.getInertiaProperties(this.getMass()));
        this.updateBoundingBox();
        this.setActive();
    }

    getLength() {
        return this._length;
    }

    getBottomPos(state) {
        const temp = state.getOrientationCols()[1];
        const pos = state.position;
        const t = -this._length / 2 - this._radius;
        return new Vector3(pos.x + temp.x * t, pos.y + temp.y * t, pos.z + temp.z * t);
    }

    getEndPos(state) {
        const temp = state.getOrientationCols()[1];
        const pos = state.position;
        const t = this._length / 2 + this._radius;
        return new Vector3(pos.x + temp.x * t, pos.y + temp.y * t, pos.z + temp.z * t);
    }

    segmentIntersect(out, seg, state) {
        out.frac = 0;
        out.position = new Vector3();
        out.normal = new Vector3();

        const Ks = seg.delta;
        const kss = Ks.dot(Ks);
        const radiusSq = this._radius * this._radius;

        const cols = state.getOrientationCols();
        const cylinderAxis = new JSegment(this.getBottomPos(state), cols[1]);
        const Ke = cylinderAxis.delta;
        const Kg = cylinderAxis.origin.subtract(seg.origin);
        const kee = Ke.dot(Ke);
        if (Math.abs(kee) < JMath3D.NUM_TINY) {
            return false;
        }

        const kes = Ke.dot(Ks);
        const kgs = Kg.dot(Ks);
        const keg = Ke.dot(Kg);
        const kgg = Kg.dot(Kg);

        const sq = JMath3D.sq;
        const distSq = sq(Kg.x - Ke.x * keg / kee) + sq(Kg.y - Ke.y * keg / kee) + sq(Kg.z - Ke.z * keg / kee);
        if (distSq < radiusSq) {
            out.frac = 0;
            out.position.copy(seg.origin);
            out.normal = out.position.subtract(this.getBottomPos(state));
            out.normal.x -= cols[1].x * out.normal.dot(cols[1]);
            out.normal.y -= cols[1].y * out.normal.dot(cols[1]);
            out.normal.z -= cols[1].z * out.normal.dot(cols[1]);
            out.normal.normalize();
            return true;
        }

        const a = kee * kss - (kes * kes);
        if (Math.abs(a) < JMath3D.NUM_TINY) {
            return false;
        }
        const b = 2 * (keg * kes - kee * kgs);
        const c = kee * (kgg - radiusSq) - (keg * keg);
        const blah = (b * b) - 4 * a * c;
        if (blah < 0) {
            return false;
        }
        const t = (-b - Math.sqrt(blah)) / (2 * a);
        if (t < 0 || t > 1) {
            return false;
        }

        out.frac = t;
        out.position = seg.getPoint(t);
        out.normal = out.position.subtract(this.getBottomPos(state));
        out.normal.x -= cols[1].x * out.normal.dot(cols[1]);
        out.normal.y -= cols[1].y * out.normal.dot(cols[1]);
        out.normal.z -= cols[1].z * out.normal.dot(cols[1]);
        out.normal.normalize();
        return true;
    }

    getInertiaProperties(m) {
        const radius = this._radius;
        const length = this._length;
        const cylinderMass = m * Math.PI * radius * radius * length / this.getVolume();
        let Ixx = 0.25 * cylinderMass * radius * radius + (1 / 12) * cylinderMass * length * length;
        let Iyy = 0.5 * cylinderMass * radius * radius;
        let Izz = Ixx;

        const endMass = m - cylinderMass;
        Ixx += (0.4 * endMass * radius * radius + endMass * Math.pow(0.5 * length, 2));
        Iyy += (0.2 * endMass * radius * radius);
        Izz += (0.4 * endMass * radius * radius + endMass * Math.pow(0.5 * length, 2));

        return new Matrix44([Ixx, 0, 0, 0, 0, Iyy, 0, 0, 0, 0, Izz, 0, 0, 0, 0, 1]);
    }

    updateBoundingBox() {
        this._boundingBox.clear();
        this._boundingBox.addCapsule(this);
    }

    getBoundingSphere(r, l) {
        return Math.sqrt(Math.pow(l / 2, 2) + r * r) + r;
    }

    getVolume() {
        const radius = this._radius;
        return (4 / 3) * Math.PI * radius * radius * radius + this._length * Math.PI * radius * radius;
    }
}
