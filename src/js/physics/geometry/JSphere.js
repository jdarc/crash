import RigidBody from "../physics/RigidBody";
import Matrix44 from "../math/Matrix44";
import Vector3 from "../math/Vector3";

export default class JSphere extends RigidBody {
    constructor(r) {
        super();
        this.name = null;
        this._type = "SPHERE";
        this._radius = r;
        this._boundingSphere = this._radius;
        this.setMass(1);
        this.updateBoundingBox();
    }

    get_radius() {
        return this._radius;
    }

    set_radius(r) {
        this._radius = r;
        this._boundingSphere = this._radius;
        this.setInertia(this.getInertiaProperties(this.getMass()));
        this.setActive();
        this.updateBoundingBox();

    }

    segmentIntersect(out, seg, state) {
        out.frac = 0;
        out.position = new Vector3();
        out.normal = new Vector3();

        const r = seg.delta;
        const s = seg.origin.subtract(state.position);

        const radiusSq = this._radius * this._radius;
        const rSq = r.getLengthSquared();
        if (rSq < radiusSq) {
            out.frac = 0;
            out.position = seg.origin.clone();
            out.normal = out.position.subtract(state.position);
            out.normal.normalize();
            return true;
        }

        const sDotr = s.dot(r);
        const sSq = s.getLengthSquared();
        const sigma = sDotr * sDotr - rSq * (sSq - radiusSq);
        if (sigma < 0) {
            return false;
        }
        const sigmaSqrt = Math.sqrt(sigma);
        const lambda1 = (-sDotr - sigmaSqrt) / rSq;
        const lambda2 = (-sDotr + sigmaSqrt) / rSq;
        if (lambda1 > 1 || lambda2 < 0) {
            return false;
        }
        const frac = Math.max(lambda1, 0);
        out.frac = frac;
        out.position = seg.getPoint(frac);
        out.normal = out.position.subtract(state.position);
        out.normal.normalize();
        return true;
    }

    getInertiaProperties(m) {
        const Ixx = 0.4 * m * this._radius * this._radius;
        return new Matrix44([Ixx, 0, 0, 0, 0, Ixx, 0, 0, 0, 0, Ixx, 0, 0, 0, 0, 1]);
    }

    updateBoundingBox() {
        this._boundingBox.clear();
        this._boundingBox.addSphere(this);
    }
}

