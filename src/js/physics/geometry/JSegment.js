import JMath3D from "../JMath3D";
import Vector3 from "../math/Vector3";
import JRay from "./JRay";

class SegmentInfo {
    constructor(rkPnt, pfLParam, rfSqrDistance) {
        this.rkPnt = rkPnt || new Vector3;
        this.pfLParam = isNaN(pfLParam) ? 0 : pfLParam;
        this.rfSqrDistance = isNaN(rfSqrDistance) ? 0 : rfSqrDistance;
    }
}

export default class JSegment {
    constructor(_origin, _delta) {
        this.origin = _origin;
        this.delta = _delta;
    }

    getPoint(t) {
        return this.origin.add(new Vector3(this.delta.x * t, this.delta.y * t, this.delta.z * t));
    }

    getEnd() {
        return this.origin.add(this.delta);
    }

    clone() {
        return new JSegment(this.origin.clone(), this.delta.clone());
    }

    segmentSegmentDistanceSq(out, seg) {
        let fB1, fS, fT, fSqrDist, fTmp;
        const kDiff = this.origin.subtract(seg.origin);
        const fA00 = this.delta.getLengthSquared();
        const fA01 = -this.delta.dot(seg.delta);
        const fA11 = seg.delta.getLengthSquared();
        const fB0 = kDiff.dot(this.delta);
        const fC = kDiff.getLengthSquared();
        const fDet = Math.abs(fA00 * fA11 - fA01 * fA01);
        if (fDet >= JMath3D.NUM_TINY) {
            fB1 = -kDiff.dot(seg.delta);
            fS = fA01 * fB1 - fA11 * fB0;
            fT = fA01 * fB0 - fA00 * fB1;
            if (fS >= 0) {
                if (fS <= fDet) {
                    if (fT >= 0) {
                        if (fT <= fDet) {
                            const fInvDet = 1 / fDet;
                            fS *= fInvDet;
                            fT *= fInvDet;
                            fSqrDist = fS * (fA00 * fS + fA01 * fT + 2 * fB0) +
                                fT * (fA01 * fS + fA11 * fT + 2 * fB1) + fC;
                        } else {
                            fT = 1;
                            fTmp = fA01 + fB0;
                            if (fTmp >= 0) {
                                fS = 0;
                                fSqrDist = fA11 + 2 * fB1 + fC;
                            } else if (-fTmp >= fA00) {
                                fS = 1;
                                fSqrDist = fA00 + fA11 + fC + 2 * (fB1 + fTmp);
                            } else {
                                fS = -fTmp / fA00;
                                fSqrDist = fTmp * fS + fA11 + 2 * fB1 + fC;
                            }
                        }
                    } else {
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
                    }
                } else {
                    if (fT >= 0) {
                        if (fT <= fDet) {
                            fS = 1;
                            fTmp = fA01 + fB1;
                            if (fTmp >= 0) {
                                fT = 0;
                                fSqrDist = fA00 + 2 * fB0 + fC;
                            } else if (-fTmp >= fA11) {
                                fT = 1;
                                fSqrDist = fA00 + fA11 + fC + 2 * (fB0 + fTmp);
                            } else {
                                fT = -fTmp / fA11;
                                fSqrDist = fTmp * fT + fA00 + 2 * fB0 + fC;
                            }
                        } else {
                            fTmp = fA01 + fB0;
                            if (-fTmp <= fA00) {
                                fT = 1;
                                if (fTmp >= 0) {
                                    fS = 0;
                                    fSqrDist = fA11 + 2 * fB1 + fC;
                                } else {
                                    fS = -fTmp / fA00;
                                    fSqrDist = fTmp * fS + fA11 + 2 * fB1 + fC;
                                }
                            } else {
                                fS = 1;
                                fTmp = fA01 + fB1;
                                if (fTmp >= 0) {
                                    fT = 0;
                                    fSqrDist = fA00 + 2 * fB0 + fC;
                                } else if (-fTmp >= fA11) {
                                    fT = 1;
                                    fSqrDist = fA00 + fA11 + fC + 2 * (fB0 + fTmp);
                                } else {
                                    fT = -fTmp / fA11;
                                    fSqrDist = fTmp * fT + fA00 + 2 * fB0 + fC;
                                }
                            }
                        }
                    } else {
                        if (-fB0 < fA00) {
                            fT = 0;
                            if (fB0 >= 0) {
                                fS = 0;
                                fSqrDist = fC;
                            } else {
                                fS = -fB0 / fA00;
                                fSqrDist = fB0 * fS + fC;
                            }
                        } else {
                            fS = 1;
                            fTmp = fA01 + fB1;
                            if (fTmp >= 0) {
                                fT = 0;
                                fSqrDist = fA00 + 2 * fB0 + fC;
                            } else if (-fTmp >= fA11) {
                                fT = 1;
                                fSqrDist = fA00 + fA11 + fC + 2 * (fB0 + fTmp);
                            } else {
                                fT = -fTmp / fA11;
                                fSqrDist = fTmp * fT + fA00 + 2 * fB0 + fC;
                            }
                        }
                    }
                }
            } else {
                if (fT >= 0) {
                    if (fT <= fDet) {
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
                    } else {
                        fTmp = fA01 + fB0;
                        if (fTmp < 0) {
                            fT = 1;
                            if (-fTmp >= fA00) {
                                fS = 1;
                                fSqrDist = fA00 + fA11 + fC + 2 * (fB1 + fTmp);
                            } else {
                                fS = -fTmp / fA00;
                                fSqrDist = fTmp * fS + fA11 + 2 * fB1 + fC;
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
                    }
                } else {
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
                }
            }
        } else {
            if (fA01 > 0) {
                if (fB0 >= 0) {
                    fS = 0;
                    fT = 0;
                    fSqrDist = fC;
                } else if (-fB0 <= fA00) {
                    fS = -fB0 / fA00;
                    fT = 0;
                    fSqrDist = fB0 * fS + fC;
                } else {
                    fB1 = -kDiff.dot(seg.delta);
                    fS = 1;
                    fTmp = fA00 + fB0;
                    if (-fTmp >= fA01) {
                        fT = 1;
                        fSqrDist = fA00 + fA11 + fC + 2 * (fA01 + fB0 + fB1);
                    } else {
                        fT = -fTmp / fA01;
                        fSqrDist = fA00 + 2 * fB0 + fC + fT * (fA11 * fT + 2 * (fA01 + fB1));
                    }
                }
            } else {
                if (-fB0 >= fA00) {
                    fS = 1;
                    fT = 0;
                    fSqrDist = fA00 + 2 * fB0 + fC;
                } else if (fB0 <= 0) {
                    fS = -fB0 / fA00;
                    fT = 0;
                    fSqrDist = fB0 * fS + fC;
                } else {
                    fB1 = -kDiff.dot(seg.delta);
                    fS = 0;
                    if (fB0 >= -fA01) {
                        fT = 1;
                        fSqrDist = fA11 + 2 * fB1 + fC;
                    } else {
                        fT = -fB0 / fA01;
                        fSqrDist = fC + fT * (2 * fB1 + fA11 * fT);
                    }
                }
            }
        }

        out[0] = fS;
        out[1] = fT;
        return Math.abs(fSqrDist);
    }

    pointSegmentDistanceSq(out, pt) {
        let kDiff = pt.subtract(this.origin);
        let fT = kDiff.dot(this.delta);

        if (fT <= 0) {
            fT = 0;
        } else {
            const fSqrLen = this.delta.getLengthSquared();
            if (fT >= fSqrLen) {
                fT = 1;
                kDiff = kDiff.subtract(this.delta);
            } else {
                fT /= fSqrLen;
                kDiff = kDiff.subtract(new Vector3(this.delta.x * fT, this.delta.y * fT, this.delta.z * fT));
            }
        }
        out[0] = fT;
        return kDiff.getLengthSquared();
    }

    segmentBoxDistanceSq(out, rkBox, boxState) {
        out[3] = 0;
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;

        const obj = [];
        const kRay = new JRay(this.origin, this.delta);
        let fSqrDistance = this.sqrDistanceLine(obj, kRay, rkBox, boxState);
        if (obj[3] >= 0) {
            if (obj[3] <= 1) {
                out[3] = obj[3];
                out[0] = obj[0];
                out[1] = obj[1];
                out[2] = obj[2];
                return Math.max(fSqrDistance, 0);
            } else {
                fSqrDistance = this.sqrDistancePoint(out, this.origin.add(this.delta), rkBox, boxState);
                out[3] = 1;
                return Math.max(fSqrDistance, 0);
            }
        } else {
            fSqrDistance = this.sqrDistancePoint(out, this.origin, rkBox, boxState);
            out[3] = 0;
            return Math.max(fSqrDistance, 0);
        }

    }

    sqrDistanceLine(out, rkLine, rkBox, boxState) {
        let kDiff, kPnt, kDir;
        const orientationCols = boxState.getOrientationCols();
        out[3] = 0;
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;

        kDiff = rkLine.origin.subtract(boxState.position);
        kPnt = new Vector3(kDiff.dot(orientationCols[0]),
            kDiff.dot(orientationCols[1]),
            kDiff.dot(orientationCols[2]));

        kDir = new Vector3(rkLine.dir.dot(orientationCols[0]),
            rkLine.dir.dot(orientationCols[1]),
            rkLine.dir.dot(orientationCols[2]));

        let kPntArr = [kPnt.x, kPnt.y, kPnt.z];
        const kDirArr = [kDir.x, kDir.y, kDir.z];
        const bReflect = [];
        for (let i = 0; i < 3; i++) {
            if (kDirArr[i] < 0) {
                kPntArr[i] = -kPntArr[i];
                kDirArr[i] = -kDirArr[i];
                bReflect[i] = true;
            } else {
                bReflect[i] = false;
            }
        }

        kPnt.x = kPntArr[0];
        kPnt.y = kPntArr[1];
        kPnt.z = kPntArr[2];
        kDir.x = kDirArr[0];
        kDir.y = kDirArr[1];
        kDir.z = kDirArr[2];
        const obj = new SegmentInfo(kPnt.clone(), 0, 0);

        if (kDir.x > 0) {
            if (kDir.y > 0) {
                if (kDir.z > 0) {
                    this.caseNoZeros(obj, kDir, rkBox);
                    out[3] = obj.pfLParam;
                } else {
                    this.case0(obj, 0, 1, 2, kDir, rkBox);
                    out[3] = obj.pfLParam;
                }
            } else {
                if (kDir.z > 0) {
                    this.case0(obj, 0, 2, 1, kDir, rkBox);
                    out[3] = obj.pfLParam;
                } else {
                    this.case00(obj, 0, 1, 2, kDir, rkBox);
                    out[3] = obj.pfLParam;
                }
            }
        } else {
            if (kDir.y > 0) {
                if (kDir.z > 0) {
                    this.case0(obj, 1, 2, 0, kDir, rkBox);
                    out[3] = obj.pfLParam;
                } else {
                    this.case00(obj, 1, 0, 2, kDir, rkBox);
                    out[3] = obj.pfLParam;
                }
            } else {
                if (kDir.z > 0) {
                    this.case00(obj, 2, 0, 1, kDir, rkBox);
                    out[3] = obj.pfLParam;
                } else {
                    this.case000(obj, rkBox);
                    out[3] = 0;
                }
            }
        }

        kPntArr = [obj.rkPnt.x, obj.rkPnt.y, obj.rkPnt.z];
        for (let i = 0; i < 3; i++) {
            if (bReflect[i]) {
                kPntArr[i] = -kPntArr[i];
            }
        }
        obj.rkPnt.x = kPntArr[0];
        obj.rkPnt.y = kPntArr[1];
        obj.rkPnt.z = kPntArr[2];
        out[0] = obj.rkPnt.x;
        out[1] = obj.rkPnt.y;
        out[2] = obj.rkPnt.z;

        return Math.max(obj.rfSqrDistance, 0);

    }

    sqrDistancePoint(out, rkPoint, rkBox, boxState) {
        let kDiff, kClosest, boxHalfSide;
        let fSqrDistance = 0, fDelta;

        const orientationVector = boxState.getOrientationCols();
        kDiff = rkPoint.subtract(boxState.position);
        kClosest = new Vector3(kDiff.dot(orientationVector[0]),
            kDiff.dot(orientationVector[1]),
            kDiff.dot(orientationVector[2]));

        boxHalfSide = rkBox.getHalfSideLengths();

        if (kClosest.x < -boxHalfSide.x) {
            fDelta = kClosest.x + boxHalfSide.x;
            fSqrDistance += (fDelta * fDelta);
            kClosest.x = -boxHalfSide.x;
        } else if (kClosest.x > boxHalfSide.x) {
            fDelta = kClosest.x - boxHalfSide.x;
            fSqrDistance += (fDelta * fDelta);
            kClosest.x = boxHalfSide.x;
        }

        if (kClosest.y < -boxHalfSide.y) {
            fDelta = kClosest.y + boxHalfSide.y;
            fSqrDistance += (fDelta * fDelta);
            kClosest.y = -boxHalfSide.y;
        } else if (kClosest.y > boxHalfSide.y) {
            fDelta = kClosest.y - boxHalfSide.y;
            fSqrDistance += (fDelta * fDelta);
            kClosest.y = boxHalfSide.y;
        }

        if (kClosest.z < -boxHalfSide.z) {
            fDelta = kClosest.z + boxHalfSide.z;
            fSqrDistance += (fDelta * fDelta);
            kClosest.z = -boxHalfSide.z;
        } else if (kClosest.z > boxHalfSide.z) {
            fDelta = kClosest.z - boxHalfSide.z;
            fSqrDistance += (fDelta * fDelta);
            kClosest.z = boxHalfSide.z;
        }

        out[0] = kClosest.x;
        out[1] = kClosest.y;
        out[2] = kClosest.z;

        return Math.max(fSqrDistance, 0);

    }

    face(out, i0, i1, i2, rkDir, rkBox, rkPmE) {

        let fLSqr, fInv, fTmp, fParam, fT, fDelta;

        const kPpE = new Vector3();
        const boxHalfSide = rkBox.getHalfSideLengths();

        let boxHalfArr, rkPntArr, rkDirArr, kPpEArr, rkPmEArr;
        boxHalfArr = [boxHalfSide.x, boxHalfSide.y, boxHalfSide.z];
        rkPntArr = [out.rkPnt.x, out.rkPnt.y, out.rkPnt.z];
        rkDirArr = [rkDir.x, rkDir.y, rkDir.z];
        kPpEArr = [kPpE.x, kPpE.y, kPpE.z];
        rkPmEArr = [rkPmE.x, rkPmE.y, rkPmE.z];
        kPpEArr[i1] = rkPntArr[i1] + boxHalfArr[i1];
        kPpEArr[i2] = rkPntArr[i2] + boxHalfArr[i2];
        rkPmE.x = kPpEArr[0];
        rkPmE.y = kPpEArr[1];
        rkPmE.z = kPpEArr[2];
        if (rkDirArr[i0] * kPpEArr[i1] >= rkDirArr[i1] * rkPmEArr[i0]) {
            if (rkDirArr[i0] * kPpEArr[i2] >= rkDirArr[i2] * rkPmEArr[i0]) {
                rkPntArr[i0] = boxHalfArr[i0];
                fInv = 1 / rkDirArr[i0];
                rkPntArr[i1] -= (rkDirArr[i1] * rkPmEArr[i0] * fInv);
                rkPntArr[i2] -= (rkDirArr[i2] * rkPmEArr[i0] * fInv);
                out.pfLParam = -rkPmEArr[i0] * fInv;
                out.rkPnt.x = rkPntArr[0];
                out.rkPnt.y = rkPntArr[1];
                out.rkPnt.z = rkPntArr[2];
            } else {
                fLSqr = rkDirArr[i0] * rkDirArr[i0] + rkDirArr[i2] * rkDirArr[i2];
                fTmp = fLSqr * kPpEArr[i1] - rkDirArr[i1] * (rkDirArr[i0] * rkPmEArr[i0] + rkDirArr[i2] * kPpEArr[i2]);
                if (fTmp <= 2 * fLSqr * boxHalfArr[i1]) {
                    fT = fTmp / fLSqr;
                    fLSqr += (rkDirArr[i1] * rkDirArr[i1]);
                    fTmp = kPpEArr[i1] - fT;
                    fDelta = rkDirArr[i0] * rkPmEArr[i0] + rkDirArr[i1] * fTmp + rkDirArr[i2] * kPpEArr[i2];
                    fParam = -fDelta / fLSqr;
                    out.rfSqrDistance += (rkPmEArr[i0] * rkPmEArr[i0] + fTmp * fTmp + kPpEArr[i2] * kPpEArr[i2] +
                        fDelta * fParam);

                    out.pfLParam = fParam;
                    rkPntArr[i0] = boxHalfArr[i0];
                    rkPntArr[i1] = fT - boxHalfArr[i1];
                    rkPntArr[i2] = -boxHalfArr[i2];
                    out.rkPnt.x = rkPntArr[0];
                    out.rkPnt.y = rkPntArr[1];
                    out.rkPnt.z = rkPntArr[2];
                } else {
                    fLSqr += (rkDirArr[i1] * rkDirArr[i1]);
                    fDelta = rkDirArr[i0] * rkPmEArr[i0] + rkDirArr[i1] * rkPmEArr[i1] + rkDirArr[i2] * kPpEArr[i2];
                    fParam = -fDelta / fLSqr;
                    out.rfSqrDistance += (rkPmEArr[i0] * rkPmEArr[i0] + rkPmEArr[i1] * rkPmEArr[i1] + kPpEArr[i2] * kPpEArr[i2] + fDelta * fParam);

                    out.pfLParam = fParam;
                    rkPntArr[i0] = boxHalfArr[i0];
                    rkPntArr[i1] = boxHalfArr[i1];
                    rkPntArr[i2] = -boxHalfArr[i2];
                    out.rkPnt.x = rkPntArr[0];
                    out.rkPnt.y = rkPntArr[1];
                    out.rkPnt.z = rkPntArr[2];
                }
            }
        } else {
            if (rkDirArr[i0] * kPpEArr[i2] >= rkDirArr[i2] * rkPmEArr[i0]) {
                fLSqr = rkDirArr[i0] * rkDirArr[i0] + rkDirArr[i1] * rkDirArr[i1];
                fTmp = fLSqr * kPpEArr[i2] - rkDirArr[i2] * (rkDirArr[i0] * rkPmEArr[i0] + rkDirArr[i1] * kPpEArr[i1]);
                if (fTmp <= 2 * fLSqr * boxHalfArr[i2]) {
                    fT = fTmp / fLSqr;
                    fLSqr += (rkDirArr[i2] * rkDirArr[i2]);
                    fTmp = kPpEArr[i2] - fT;
                    fDelta = rkDirArr[i0] * rkPmEArr[i0] + rkDirArr[i1] * kPpEArr[i1] + rkDirArr[i2] * fTmp;
                    fParam = -fDelta / fLSqr;
                    out.rfSqrDistance += (rkPmEArr[i0] * rkPmEArr[i0] + kPpEArr[i1] * kPpEArr[i1] + fTmp * fTmp + fDelta * fParam);

                    out.pfLParam = fParam;
                    rkPntArr[i0] = boxHalfArr[i0];
                    rkPntArr[i1] = -boxHalfArr[i1];
                    rkPntArr[i2] = fT - boxHalfArr[i2];
                    out.rkPnt.x = rkPntArr[0];
                    out.rkPnt.y = rkPntArr[1];
                    out.rkPnt.z = rkPntArr[2];
                } else {
                    fLSqr += (rkDirArr[i2] * rkDirArr[i2]);
                    fDelta = rkDirArr[i0] * rkPmEArr[i0] + rkDirArr[i1] * kPpEArr[i1] + rkDirArr[i2] * rkPmEArr[i2];
                    fParam = -fDelta / fLSqr;
                    out.rfSqrDistance += (rkPmEArr[i0] * rkPmEArr[i0] + kPpEArr[i1] * kPpEArr[i1] + rkPmEArr[i2] * rkPmEArr[i2] + fDelta * fParam);

                    out.pfLParam = fParam;
                    rkPntArr[i0] = boxHalfArr[i0];
                    rkPntArr[i1] = -boxHalfArr[i1];
                    rkPntArr[i2] = boxHalfArr[i2];
                    out.rkPnt.x = rkPntArr[0];
                    out.rkPnt.y = rkPntArr[1];
                    out.rkPnt.z = rkPntArr[2];
                }
            } else {
                fLSqr = rkDirArr[i0] * rkDirArr[i0] + rkDirArr[i2] * rkDirArr[i2];
                fTmp = fLSqr * kPpEArr[i1] - rkDirArr[i1] * (rkDirArr[i0] * rkPmEArr[i0] + rkDirArr[i2] * kPpEArr[i2]);
                if (fTmp >= 0) {
                    if (fTmp <= 2 * fLSqr * boxHalfArr[i1]) {
                        fT = fTmp / fLSqr;
                        fLSqr += (rkDirArr[i1] * rkDirArr[i1]);
                        fTmp = kPpEArr[i1] - fT;
                        fDelta = rkDirArr[i0] * rkPmEArr[i0] + rkDirArr[i1] * fTmp + rkDirArr[i2] * kPpEArr[i2];
                        fParam = -fDelta / fLSqr;
                        out.rfSqrDistance += (rkPmEArr[i0] * rkPmEArr[i0] + fTmp * fTmp + kPpEArr[i2] * kPpEArr[i2] + fDelta * fParam);

                        out.pfLParam = fParam;
                        rkPntArr[i0] = boxHalfArr[i0];
                        rkPntArr[i1] = fT - boxHalfArr[i1];
                        rkPntArr[i2] = -boxHalfArr[i2];
                        out.rkPnt.x = rkPntArr[0];
                        out.rkPnt.y = rkPntArr[1];
                        out.rkPnt.z = rkPntArr[2];
                    } else {
                        fLSqr += (rkDirArr[i1] * rkDirArr[i1]);
                        fDelta = rkDirArr[i0] * rkPmEArr[i0] + rkDirArr[i1] * rkPmEArr[i1] + rkDirArr[i2] * kPpEArr[i2];
                        fParam = -fDelta / fLSqr;
                        out.rfSqrDistance += (rkPmEArr[i0] * rkPmEArr[i0] + rkPmEArr[i1] * rkPmEArr[i1] + kPpEArr[i2] * kPpEArr[i2] + fDelta * fParam);

                        out.pfLParam = fParam;
                        rkPntArr[i0] = boxHalfArr[i0];
                        rkPntArr[i1] = boxHalfArr[i1];
                        rkPntArr[i2] = -boxHalfArr[i2];
                        out.rkPnt.x = rkPntArr[0];
                        out.rkPnt.y = rkPntArr[1];
                        out.rkPnt.z = rkPntArr[2];
                    }
                    return;
                }

                fLSqr = rkDirArr[i0] * rkDirArr[i0] + rkDirArr[i1] * rkDirArr[i1];
                fTmp = fLSqr * kPpEArr[i2] - rkDirArr[i2] * (rkDirArr[i0] * rkPmEArr[i0] + rkDirArr[i1] * kPpEArr[i1]);
                if (fTmp >= 0) {
                    if (fTmp <= 2 * fLSqr * boxHalfArr[i2]) {
                        fT = fTmp / fLSqr;
                        fLSqr += (rkDirArr[i2] * rkDirArr[i2]);
                        fTmp = kPpEArr[i2] - fT;
                        fDelta = rkDirArr[i0] * rkPmEArr[i0] + rkDirArr[i1] * kPpEArr[i1] + rkDirArr[i2] * fTmp;
                        fParam = -fDelta / fLSqr;
                        out.rfSqrDistance += (rkPmEArr[i0] * rkPmEArr[i0] + kPpEArr[i1] * kPpEArr[i1] + fTmp * fTmp + fDelta * fParam);

                        out.pfLParam = fParam;
                        rkPntArr[i0] = boxHalfArr[i0];
                        rkPntArr[i1] = -boxHalfArr[i1];
                        rkPntArr[i2] = fT - boxHalfArr[i2];
                        out.rkPnt.x = rkPntArr[0];
                        out.rkPnt.y = rkPntArr[1];
                        out.rkPnt.z = rkPntArr[2];
                    } else {
                        fLSqr += (rkDirArr[i2] * rkDirArr[i2]);
                        fDelta = rkDirArr[i0] * rkPmEArr[i0] + rkDirArr[i1] * kPpEArr[i1] + rkDirArr[i2] * rkPmEArr[i2];
                        fParam = -fDelta / fLSqr;
                        out.rfSqrDistance += (rkPmEArr[i0] * rkPmEArr[i0] + kPpEArr[i1] * kPpEArr[i1] + rkPmEArr[i2] * rkPmEArr[i2] + fDelta * fParam);

                        out.pfLParam = fParam;
                        rkPntArr[i0] = boxHalfArr[i0];
                        rkPntArr[i1] = -boxHalfArr[i1];
                        rkPntArr[i2] = boxHalfArr[i2];
                        out.rkPnt.x = rkPntArr[0];
                        out.rkPnt.y = rkPntArr[1];
                        out.rkPnt.z = rkPntArr[2];
                    }
                    return;
                }

                fLSqr += (rkDirArr[i2] * rkDirArr[i2]);
                fDelta = rkDirArr[i0] * rkPmEArr[i0] + rkDirArr[i1] * kPpEArr[i1] + rkDirArr[i2] * kPpEArr[i2];
                fParam = -fDelta / fLSqr;
                out.rfSqrDistance += (rkPmEArr[i0] * rkPmEArr[i0] + kPpEArr[i1] * kPpEArr[i1] + kPpEArr[i2] * kPpEArr[i2] + fDelta * fParam);

                out.pfLParam = fParam;
                rkPntArr[i0] = boxHalfArr[i0];
                rkPntArr[i1] = -boxHalfArr[i1];
                rkPntArr[i2] = -boxHalfArr[i2];
                out.rkPnt.x = rkPntArr[0];
                out.rkPnt.y = rkPntArr[1];
                out.rkPnt.z = rkPntArr[2];
            }
        }

    }

    caseNoZeros(out, rkDir, rkBox) {
        const boxHalfSide = rkBox.getHalfSideLengths();
        const kPmE = new Vector3(out.rkPnt.x - boxHalfSide.x,
            out.rkPnt.y - boxHalfSide.y,
            out.rkPnt.z - boxHalfSide.z);

        const fProdDxPy = rkDir.x * kPmE.y,
            fProdDyPx = rkDir.y * kPmE.x;
        let fProdDzPx,
            fProdDxPz,
            fProdDzPy,
            fProdDyPz;

        if (fProdDyPx >= fProdDxPy) {
            fProdDzPx = rkDir.z * kPmE.x;
            fProdDxPz = rkDir.x * kPmE.z;
            if (fProdDzPx >= fProdDxPz) {
                this.face(out, 0, 1, 2, rkDir, rkBox, kPmE);
            } else {
                this.face(out, 2, 0, 1, rkDir, rkBox, kPmE);
            }
        } else {
            fProdDzPy = rkDir.z * kPmE.y;
            fProdDyPz = rkDir.y * kPmE.z;
            if (fProdDzPy >= fProdDyPz) {
                this.face(out, 1, 2, 0, rkDir, rkBox, kPmE);
            } else {
                this.face(out, 2, 0, 1, rkDir, rkBox, kPmE);
            }
        }
    }

    case0(out, i0, i1, i2, rkDir, rkBox) {

        const boxHalfSide = rkBox.getHalfSideLengths();
        let boxHalfArr, rkPntArr, rkDirArr;
        boxHalfArr = [boxHalfSide.x, boxHalfSide.y, boxHalfSide.z];
        rkPntArr = [out.rkPnt.x, out.rkPnt.y, out.rkPnt.z];
        rkDirArr = [rkDir.x, rkDir.y, rkDir.z];
        const fPmE0 = rkPntArr[i0] - boxHalfArr[i0], fPmE1 = rkPntArr[i1] - boxHalfArr[i1], fProd0 = rkDirArr[i1] * fPmE0,
            fProd1 = rkDirArr[i0] * fPmE1;
        let fDelta, fInvLSqr, fInv, fPpE1, fPpE0;

        if (fProd0 >= fProd1) {
            rkPntArr[i0] = boxHalfArr[i0];

            fPpE1 = rkPntArr[i1] + boxHalfArr[i1];
            fDelta = fProd0 - rkDirArr[i0] * fPpE1;
            if (fDelta >= 0) {
                fInvLSqr = 1 / (rkDirArr[i0] * rkDirArr[i0] + rkDirArr[i1] * rkDirArr[i1]);
                out.rfSqrDistance += (fDelta * fDelta * fInvLSqr);
                rkPntArr[i1] = -boxHalfArr[i1];
                out.pfLParam = -(rkDirArr[i0] * fPmE0 + rkDirArr[i1] * fPpE1) * fInvLSqr;
            } else {
                fInv = 1 / rkDirArr[i0];
                rkPntArr[i1] -= (fProd0 * fInv);
                out.pfLParam = -fPmE0 * fInv;
            }
            out.rkPnt.x = rkPntArr[0];
            out.rkPnt.y = rkPntArr[1];
            out.rkPnt.z = rkPntArr[2];
        } else {
            rkPntArr[i1] = boxHalfArr[i1];

            fPpE0 = rkPntArr[i0] + boxHalfArr[i0];
            fDelta = fProd1 - rkDirArr[i1] * fPpE0;
            if (fDelta >= 0) {
                fInvLSqr = 1 / (rkDirArr[i0] * rkDirArr[i0] + rkDirArr[i1] * rkDirArr[i1]);
                out.rfSqrDistance += (fDelta * fDelta * fInvLSqr);

                rkPntArr[i0] = -boxHalfArr[i0];
                out.pfLParam = -(rkDirArr[i0] * fPpE0 + rkDirArr[i1] * fPmE1) * fInvLSqr;
            } else {
                fInv = 1 / rkDirArr[i1];
                rkPntArr[i0] -= (fProd1 * fInv);
                out.pfLParam = -fPmE1 * fInv;
            }
            out.rkPnt.x = rkPntArr[0];
            out.rkPnt.y = rkPntArr[1];
            out.rkPnt.z = rkPntArr[2];
        }

        if (rkPntArr[i2] < -boxHalfArr[i2]) {
            fDelta = rkPntArr[i2] + boxHalfArr[i2];
            out.rfSqrDistance += (fDelta * fDelta);
            rkPntArr[i2] = -boxHalfArr[i2];
        } else if (rkPntArr[i2] > boxHalfArr[i2]) {
            fDelta = rkPntArr[i2] - boxHalfArr[i2];
            out.rfSqrDistance += (fDelta * fDelta);
            rkPntArr[i2] = boxHalfArr[i2];
        }
        out.rkPnt.x = rkPntArr[0];
        out.rkPnt.y = rkPntArr[1];
        out.rkPnt.z = rkPntArr[2];

    }

    case00(out, i0, i1, i2, rkDir, rkBox) {

        let fDelta = 0;
        const boxHalfSide = rkBox.getHalfSideLengths();

        let boxHalfArr, rkPntArr, rkDirArr;
        boxHalfArr = [boxHalfSide.x, boxHalfSide.y, boxHalfSide.z];
        rkPntArr = [out.rkPnt.x, out.rkPnt.y, out.rkPnt.z];
        rkDirArr = [rkDir.x, rkDir.y, rkDir.z];
        out.pfLParam = (boxHalfArr[i0] - rkPntArr[i0]) / rkDirArr[i0];

        rkPntArr[i0] = boxHalfArr[i0];

        if (rkPntArr[i1] < -boxHalfArr[i1]) {
            fDelta = rkPntArr[i1] + boxHalfArr[i1];
            out.rfSqrDistance += (fDelta * fDelta);
            rkPntArr[i1] = -boxHalfArr[i1];
        } else if (rkPntArr[i1] > boxHalfArr[i1]) {
            fDelta = rkPntArr[i1] - boxHalfArr[i1];
            out.rfSqrDistance += (fDelta * fDelta);
            rkPntArr[i1] = boxHalfArr[i1];
        }

        if (rkPntArr[i2] < -boxHalfArr[i2]) {
            fDelta = rkPntArr[i2] + boxHalfArr[i2];
            out.rfSqrDistance += (fDelta * fDelta);
            rkPntArr[i2] = -boxHalfArr[i2];
        } else if (rkPntArr[i2] > boxHalfArr[i2]) {
            fDelta = rkPntArr[i2] - boxHalfArr[i2];
            out.rfSqrDistance += (fDelta * fDelta);
            rkPntArr[i2] = boxHalfArr[i2];
        }

        out.rkPnt.x = rkPntArr[0];
        out.rkPnt.y = rkPntArr[1];
        out.rkPnt.z = rkPntArr[2];
    }

    case000(out, rkBox) {

        let fDelta = 0;
        const boxHalfSide = rkBox.getHalfSideLengths();

        if (out.rkPnt.x < -boxHalfSide.x) {
            fDelta = out.rkPnt.x + boxHalfSide.x;
            out.rfSqrDistance += (fDelta * fDelta);
            out.rkPnt.x = -boxHalfSide.x;
        } else if (out.rkPnt.x > boxHalfSide.x) {
            fDelta = out.rkPnt.x - boxHalfSide.x;
            out.rfSqrDistance += (fDelta * fDelta);
            out.rkPnt.x = boxHalfSide.x;
        }

        if (out.rkPnt.y < -boxHalfSide.y) {
            fDelta = out.rkPnt.y + boxHalfSide.y;
            out.rfSqrDistance += (fDelta * fDelta);
            out.rkPnt.y = -boxHalfSide.y;
        } else if (out.rkPnt.y > boxHalfSide.y) {
            fDelta = out.rkPnt.y - boxHalfSide.y;
            out.rfSqrDistance += (fDelta * fDelta);
            out.rkPnt.y = boxHalfSide.y;
        }

        if (out.rkPnt.z < -boxHalfSide.z) {
            fDelta = out.rkPnt.z + boxHalfSide.z;
            out.rfSqrDistance += (fDelta * fDelta);
            out.rkPnt.z = -boxHalfSide.z;
        } else if (out.rkPnt.z > boxHalfSide.z) {
            fDelta = out.rkPnt.z - boxHalfSide.z;
            out.rfSqrDistance += (fDelta * fDelta);
            out.rkPnt.z = boxHalfSide.z;
        }
    }
}
