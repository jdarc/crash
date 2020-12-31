import Containment from "./Containment";

export default class Frustum {
    constructor() {
        this._lft = new Float32Array(4);
        this._rgh = new Float32Array(4);
        this._top = new Float32Array(4);
        this._bot = new Float32Array(4);
        this._nea = new Float32Array(4);
        this._far = new Float32Array(4);
    }

    contains(box) {
        const vc0 = box.numberOfPointsOutside(this._rgh);
        if (vc0 === 8) return Containment.Outside;
        const vc1 = box.numberOfPointsOutside(this._top);
        if (vc1 === 8) return Containment.Outside;
        const vc2 = box.numberOfPointsOutside(this._lft);
        if (vc2 === 8) return Containment.Outside;
        const vc3 = box.numberOfPointsOutside(this._bot);
        if (vc3 === 8) return Containment.Outside;
        const vc4 = box.numberOfPointsOutside(this._nea);
        if (vc4 === 8) return Containment.Outside;
        const vc5 = box.numberOfPointsOutside(this._far);
        return vc5 === 8 ? Containment.Outside : vc0 + vc1 + vc2 + vc3 + vc4 + vc5 === 0 ? Containment.Inside : Containment.Partial;
    }

    transform(view, proj) {
        const aspectRatio = proj[5] / proj[0];
        const kk = (proj[10] - 1) / (proj[10] + 1);
        const nc = (proj[14] * (1 - kk)) / (2 * kk);
        const fc = kk * nc;

        const cx = -view[0] * view[12] - view[1] * view[13] - view[2] * view[14];
        const cy = -view[4] * view[12] - view[5] * view[13] - view[6] * view[14];
        const cz = -view[8] * view[12] - view[9] * view[13] - view[10] * view[14];

        let tx = view[2] * proj[5] - view[1] + view[0] * aspectRatio;
        let ty = view[6] * proj[5] - view[5] + view[4] * aspectRatio;
        let tz = view[10] * proj[5] - view[9] + view[8] * aspectRatio;

        this._lft[0] = (ty * view[9]) - (tz * view[5]);
        this._lft[1] = (tz * view[1]) - (tx * view[9]);
        this._lft[2] = (tx * view[5]) - (ty * view[1]);
        this._lft[3] = cx * this._lft[0] + cy * this._lft[1] + cz * this._lft[2];

        this._top[0] = (ty * view[8]) - (tz * view[4]);
        this._top[1] = (tz * view[0]) - (tx * view[8]);
        this._top[2] = (tx * view[4]) - (ty * view[0]);
        this._top[3] = cx * this._top[0] + cy * this._top[1] + cz * this._top[2];

        tx = view[2] * proj[5] + view[1] - view[0] * aspectRatio;
        ty = view[6] * proj[5] + view[5] - view[4] * aspectRatio;
        tz = view[10] * proj[5] + view[9] - view[8] * aspectRatio;

        this._rgh[0] = (view[5] * tz) - (view[9] * ty);
        this._rgh[1] = (view[9] * tx) - (view[1] * tz);
        this._rgh[2] = (view[1] * ty) - (view[5] * tx);
        this._rgh[3] = cx * this._rgh[0] + cy * this._rgh[1] + cz * this._rgh[2];

        this._bot[0] = (view[4] * tz) - (view[8] * ty);
        this._bot[1] = (view[8] * tx) - (view[0] * tz);
        this._bot[2] = (view[0] * ty) - (view[4] * tx);
        this._bot[3] = cx * this._bot[0] + cy * this._bot[1] + cz * this._bot[2];

        this._nea[0] = view[2];
        this._nea[1] = view[6];
        this._nea[2] = view[10];
        this._nea[3] = (cx - view[2] * nc) * view[2] + (cy - view[6] * nc) * view[6] + (cz - view[10] * nc) * view[10];

        this._far[0] = -view[2];
        this._far[1] = -view[6];
        this._far[2] = -view[10];
        this._far[3] = -(cx - view[2] * fc) * view[2] - (cy - view[6] * fc) * view[6] - (cz - view[10] * fc) * view[10];
    }

    isOutsideEdges(x1, y1, z1, x2, y2, z2, x3, y3, z3) {
        let pln0 = (this._lft)[0];
        let pln1 = (this._lft)[1];
        let pln2 = (this._lft)[2];
        let pln3 = (this._lft)[3];
        if (pln0 * x1 + pln1 * y1 + pln2 * z1 > pln3 &&
            pln0 * x2 + pln1 * y2 + pln2 * z2 > pln3 &&
            pln0 * x3 + pln1 * y3 + pln2 * z3 > pln3) {
            return true;
        }

        pln0 = (this._rgh)[0];
        pln1 = (this._rgh)[1];
        pln2 = (this._rgh)[2];
        pln3 = (this._rgh)[3];
        if (pln0 * x1 + pln1 * y1 + pln2 * z1 > pln3 &&
            pln0 * x2 + pln1 * y2 + pln2 * z2 > pln3 &&
            pln0 * x3 + pln1 * y3 + pln2 * z3 > pln3) {
            return true;
        }

        pln0 = (this._top)[0];
        pln1 = (this._top)[1];
        pln2 = (this._top)[2];
        pln3 = (this._top)[3];
        if (pln0 * x1 + pln1 * y1 + pln2 * z1 > pln3 &&
            pln0 * x2 + pln1 * y2 + pln2 * z2 > pln3 &&
            pln0 * x3 + pln1 * y3 + pln2 * z3 > pln3) {
            return true;
        }

        pln0 = (this._bot)[0];
        pln1 = (this._bot)[1];
        pln2 = (this._bot)[2];
        pln3 = (this._bot)[3];
        return pln0 * x1 + pln1 * y1 + pln2 * z1 > pln3 &&
            pln0 * x2 + pln1 * y2 + pln2 * z2 > pln3 &&
            pln0 * x3 + pln1 * y3 + pln2 * z3 > pln3;
    }

    computeNearIntersections(x1, y1, z1, x2, y2, z2, x3, y3, z3) {
        const a = this._nea[0] * x1 + this._nea[1] * y1 + this._nea[2] * z1 > this._nea[3] ? 1 : 0;
        const b = this._nea[0] * x2 + this._nea[1] * y2 + this._nea[2] * z2 > this._nea[3] ? 1 : 0;
        const c = this._nea[0] * x3 + this._nea[1] * y3 + this._nea[2] * z3 > this._nea[3] ? 1 : 0;
        return a + b + c;
    }

    computeFarIntersections(x1, y1, z1, x2, y2, z2, x3, y3, z3) {
        const a = this._far[0] * x1 + this._far[1] * y1 + this._far[2] * z1 > this._far[3] ? 1 : 0;
        const b = this._far[0] * x2 + this._far[1] * y2 + this._far[2] * z2 > this._far[3] ? 1 : 0;
        const c = this._far[0] * x3 + this._far[1] * y3 + this._far[2] * z3 > this._far[3] ? 1 : 0;
        return a + b + c;
    }
}



