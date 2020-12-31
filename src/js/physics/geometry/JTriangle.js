import JMath3D from "../JMath3D";
import PlaneData from "../data/PlaneData";
import SpanData from "../data/SpanData";

export default class JTriangle {
    constructor(pt0, pt1, pt2) {
        this.origin = pt0.clone();
        this.edge0 = pt1.subtract(pt0);
        this.edge1 = pt2.subtract(pt0);
    }

    get_edge2() {
        return this.edge1.subtract(this.edge0);
    }

    getNormal() {
        const N = this.edge0.cross(this.edge1);
        N.normalize();
        return N;
    }

    get_plane() {
        const pl = new PlaneData();
        pl.setWithNormal(this.origin, this.getNormal());
        return pl;
    }

    getPoint(t0, t1) {
        const d0 = this.edge0.clone();
        const d1 = this.edge1.clone();
        d0.scaleBy(t0);
        d1.scaleBy(t1);
        return this.origin.add(d0).add(d1);
    }

    getCentre() {
        const result = this.edge0.add(this.edge1);
        result.scaleBy(0.333333);
        return this.origin.add(result);
    }

    getVertex(_id) {
        switch (_id) {
            case 1:
                return this.origin.add(this.edge0);
            case 2:
                return this.origin.add(this.edge1);
            default:
                return this.origin;
        }
    }

    getSpan(axis) {
        const d0 = this.getVertex(0).dot(axis);
        const d1 = this.getVertex(1).dot(axis);
        const d2 = this.getVertex(2).dot(axis);
        const result = new SpanData();
        result.min = Math.min(d0, d1, d2);
        result.max = Math.max(d0, d1, d2);
        return result;
    }

    segmentTriangleIntersection(out, seg) {
        const p = seg.delta.cross(this.edge1);
        const a = this.edge0.dot(p);

        if (a > -JMath3D.NUM_TINY && a < JMath3D.NUM_TINY) {
            return false;
        }

        const f = 1 / a;
        const s = seg.origin.subtract(this.origin);
        const u = f * s.dot(p);

        if (u < 0 || u > 1) {
            return false;
        }

        const q = s.cross(this.edge0);
        const v = f * seg.delta.dot(q);
        if (v < 0 || (u + v) > 1) {
            return false;
        }

        const t = f * this.edge1.dot(q);
        if (t < 0 || t > 1) {
            return false;
        }

        if (out) {
            out.frac = t;
        }
        return true;
    }

    pointTriangleDistanceSq(out, point) {
        let fDenom, fNumer, fTmp1, fTmp0, fSqrDist;
        const kDiff = this.origin.subtract(point);
        const fA00 = this.edge0.getLengthSquared();
        const fA01 = this.edge0.dot(this.edge1);
        const fA11 = this.edge1.getLengthSquared();
        const fB0 = kDiff.dot(this.edge0);
        const fB1 = kDiff.dot(this.edge1);
        const fC = kDiff.getLengthSquared();
        const fDet = Math.abs(fA00 * fA11 - fA01 * fA01);
        let fS = fA01 * fB1 - fA11 * fB0;
        let fT = fA01 * fB0 - fA00 * fB1;
        if (fS + fT <= fDet) {
            if (fS < 0) {
                if (fT < 0) {
                    if (fB0 < 0) {
                        fT = 0;
                        if (-fB0 >= fA00) {
                            fS = 1;
                            fSqrDist = fA00 + 2 * fB0 + fC;
                        } else {
                            fS = -fB0 / fA00;
                            fSqrDist = fB0 * fS + fC;
                        }
                    } else {
                        fS = 0;
                        if (fB1 >= 0) {
                            fT = 0;
                            fSqrDist = fC;
                        } else if (-fB1 >= fA11) {
                            fT = 1;
                            fSqrDist = fA11 + 2 * fB1 + fC;
                        } else {
                            fT = -fB1 / fA11;
                            fSqrDist = fB1 * fT + fC;
                        }
                    }
                } else {
                    fS = 0;
                    if (fB1 >= 0) {
                        fT = 0;
                        fSqrDist = fC;
                    } else if (-fB1 >= fA11) {
                        fT = 1;
                        fSqrDist = fA11 + 2 * fB1 + fC;
                    } else {
                        fT = -fB1 / fA11;
                        fSqrDist = fB1 * fT + fC;
                    }
                }
            } else if (fT < 0) {
                fT = 0;
                if (fB0 >= 0) {
                    fS = 0;
                    fSqrDist = fC;
                } else if (-fB0 >= fA00) {
                    fS = 1;
                    fSqrDist = fA00 + 2 * fB0 + fC;
                } else {
                    fS = -fB0 / fA00;
                    fSqrDist = fB0 * fS + fC;
                }
            } else {
                const fInvDet = 1 / fDet;
                fS *= fInvDet;
                fT *= fInvDet;
                fSqrDist = fS * (fA00 * fS + fA01 * fT + 2 * fB0) + fT * (fA01 * fS + fA11 * fT + 2 * fB1) + fC;
            }
        } else {
            if (fS < 0) {
                fTmp0 = fA01 + fB0;
                fTmp1 = fA11 + fB1;
                if (fTmp1 > fTmp0) {
                    fNumer = fTmp1 - fTmp0;
                    fDenom = fA00 - 2 * fA01 + fA11;
                    if (fNumer >= fDenom) {
                        fS = 1;
                        fT = 0;
                        fSqrDist = fA00 + 2 * fB0 + fC;
                    } else {
                        fS = fNumer / fDenom;
                        fT = 1 - fS;
                        fSqrDist = fS * (fA00 * fS + fA01 * fT + 2 * fB0) + fT * (fA01 * fS + fA11 * fT + 2 * fB1) + fC;
                    }
                } else {
                    fS = 0;
                    if (fTmp1 <= 0) {
                        fT = 1;
                        fSqrDist = fA11 + 2 * fB1 + fC;
                    } else if (fB1 >= 0) {
                        fT = 0;
                        fSqrDist = fC;
                    } else {
                        fT = -fB1 / fA11;
                        fSqrDist = fB1 * fT + fC;
                    }
                }
            } else if (fT < 0) {
                fTmp0 = fA01 + fB1;
                fTmp1 = fA00 + fB0;
                if (fTmp1 > fTmp0) {
                    fNumer = fTmp1 - fTmp0;
                    fDenom = fA00 - 2 * fA01 + fA11;
                    if (fNumer >= fDenom) {
                        fT = 1;
                        fS = 0;
                        fSqrDist = fA11 + 2 * fB1 + fC;
                    } else {
                        fT = fNumer / fDenom;
                        fS = 1 - fT;
                        fSqrDist = fS * (fA00 * fS + fA01 * fT + 2 * fB0) + fT * (fA01 * fS + fA11 * fT + 2 * fB1) + fC;
                    }
                } else {
                    fT = 0;
                    if (fTmp1 <= 0) {
                        fS = 1;
                        fSqrDist = fA00 + 2 * fB0 + fC;
                    } else if (fB0 >= 0) {
                        fS = 0;
                        fSqrDist = fC;
                    } else {
                        fS = -fB0 / fA00;
                        fSqrDist = fB0 * fS + fC;
                    }
                }
            } else {
                fNumer = fA11 + fB1 - fA01 - fB0;
                if (fNumer <= 0) {
                    fS = 0;
                    fT = 1;
                    fSqrDist = fA11 + 2 * fB1 + fC;
                } else {
                    fDenom = fA00 - 2 * fA01 + fA11;
                    if (fNumer >= fDenom) {
                        fS = 1;
                        fT = 0;
                        fSqrDist = fA00 + 2 * fB0 + fC;
                    } else {
                        fS = fNumer / fDenom;
                        fT = 1 - fS;
                        fSqrDist = fS * (fA00 * fS + fA01 * fT + 2 * fB0) + fT * (fA01 * fS + fA11 * fT + 2 * fB1) + fC;
                    }
                }
            }
        }
        out[0] = fS;
        out[1] = fT;
        return Math.abs(fSqrDist);
    }
}
