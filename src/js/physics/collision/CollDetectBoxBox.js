import CollPointInfo from "./CollPointInfo";
import Vector3 from "../../math/Vector3";
import JConfig from "../JConfig";
import SpanData from "../data/SpanData";

const pointPointDistanceSq = (pt1, pt2) => {
    const x = pt2.x - pt1.x;
    const y = pt2.y - pt1.y;
    const z = pt2.z - pt1.z;
    return x * x + y * y + z * z;
};

const pointPointDistance = (pt1, pt2) => {
    const x = pt2.x - pt1.x;
    const y = pt2.y - pt1.y;
    const z = pt2.z - pt1.z;
    return Math.sqrt(x * x + y * y + z * z);
};

const disjoint = (out, axis, box0, box1, collTolerance) => {
    const obj0 = box0.getSpan(axis);
    const obj1 = box1.getSpan(axis);
    const min0 = obj0.min, max0 = obj0.max, min1 = obj1.min, max1 = obj1.max;

    if (min0 > max1 + collTolerance + JConfig.NUM_TINY ||
        min1 > max0 + collTolerance + JConfig.NUM_TINY) {
        return true;
    }

    if (max0 > max1 && min1 > min0) {
        out.depth = Math.min(max0 - min1, max1 - min0);
    } else if (max1 > max0 && min0 > min1) {
        out.depth = Math.min(max1 - min0, max0 - min1);
    } else {
        out.depth = max0 < max1 ? max0 : max1;
        out.depth -= min0 > min1 ? min0 : min1;
    }

    return false;
};

const getSupportPoint = (p, box, axis) => {
    const orientationCol = box.getCurrState().getOrientationCols();
    const as = Vector3.dot(axis, orientationCol[0]),
        au = Vector3.dot(axis, orientationCol[1]),
        ad = Vector3.dot(axis, orientationCol[2]);

    const threshold = JConfig.NUM_TINY;

    p.copy(box.getCurrState().position);

    const sideLengths = box.getSideLengths();
    if (as < -threshold) {
        p.x += orientationCol[0].x * 0.5 * sideLengths.x;
        p.y += orientationCol[0].y * 0.5 * sideLengths.x;
        p.z += orientationCol[0].z * 0.5 * sideLengths.x;
    } else if (as >= threshold) {
        p.x -= orientationCol[0].x * 0.5 * sideLengths.x;
        p.y -= orientationCol[0].y * 0.5 * sideLengths.x;
        p.z -= orientationCol[0].z * 0.5 * sideLengths.x;
    }

    if (au < -threshold) {
        p.x += orientationCol[1].x * 0.5 * sideLengths.y;
        p.y += orientationCol[1].y * 0.5 * sideLengths.y;
        p.z += orientationCol[1].z * 0.5 * sideLengths.y;
    } else if (au > threshold) {
        p.x -= orientationCol[1].x * 0.5 * sideLengths.y;
        p.y -= orientationCol[1].y * 0.5 * sideLengths.y;
        p.z -= orientationCol[1].z * 0.5 * sideLengths.y;
    }

    if (ad < -threshold) {
        p.x += orientationCol[2].x * 0.5 * sideLengths.z;
        p.y += orientationCol[2].y * 0.5 * sideLengths.z;
        p.z += orientationCol[2].z * 0.5 * sideLengths.z;
    } else if (ad > threshold) {
        p.x -= orientationCol[2].x * 0.5 * sideLengths.z;
        p.y -= orientationCol[2].y * 0.5 * sideLengths.z;
        p.z -= orientationCol[2].z * 0.5 * sideLengths.z;
    }
};

const addPoint = (pts, pt, combinationDistanceSq) => {
    let i = 0;
    const len = pts.length;
    for (; i < len; i++) {
        const ptsi = pts[i];
        if (pointPointDistanceSq(ptsi, pt) < combinationDistanceSq) {
            const count = ptsi.count || 0;
            ptsi.setTo((count * ptsi.x + pt.x) / (count + 1),
                (count * ptsi.y + pt.y) / (count + 1),
                (count * ptsi.z + pt.z) / (count + 1));
            ptsi.count = count + 1;
            return false;
        }
    }
    pts.push(pt);
    return true;
};

const getAABox2EdgeIntersectionPoints = (pts, sides, box, edgePt0, edgePt1, combinationDistanceSq) => {
    const TINY = JConfig.NUM_TINY;

    let edgeDirX = edgePt1.x - edgePt0.x;
    let edgeDirY = edgePt1.y - edgePt0.y;
    let edgeDirZ = edgePt1.z - edgePt0.z;
    const norm = 1 / Math.sqrt(edgeDirX * edgeDirX + edgeDirY * edgeDirY + edgeDirZ * edgeDirZ);
    edgeDirX *= norm;
    edgeDirY *= norm;
    edgeDirZ *= norm;

    const edgePt0Arr = [ edgePt0.x, edgePt0.y, edgePt0.z ];
    const edgePt1Arr = [ edgePt1.x, edgePt1.y, edgePt1.z ];
    const edgeDirArr = [ edgeDirX, edgeDirY, edgeDirZ ];
    const sidesArr = [ sides.x * 0.5, sides.y * 0.5, sides.z * 0.5 ];

    let num = 0;
    for (let iDir = 2; iDir >= 0; iDir--) {
        if (Math.abs(edgeDirArr[iDir]) >= 0.1) {
            const jDir = (iDir + 1) % 3;
            const kDir = (iDir + 2) % 3;
            const faceOffsets = [ -sidesArr[iDir], sidesArr[iDir] ];
            for (let iFace = 1; iFace >= 0; iFace--) {
                const dist0 = edgePt0Arr[iDir] - faceOffsets[iFace];
                const dist1 = edgePt1Arr[iDir] - faceOffsets[iFace];
                let frac = -1;
                if (dist0 * dist1 < -TINY) {
                    frac = -dist0 / (dist1 - dist0);
                } else if (Math.abs(dist0) < TINY) {
                    frac = 0;
                } else if (Math.abs(dist1) < TINY) {
                    frac = 1;
                }
                if (frac >= 0) {
                    const pt = new Vector3();
                    pt.x = (1 - frac) * edgePt0.x + frac * edgePt1.x;
                    pt.y = (1 - frac) * edgePt0.y + frac * edgePt1.y;
                    pt.z = (1 - frac) * edgePt0.z + frac * edgePt1.z;
                    const ptArr = [ pt.x, pt.y, pt.z ];
                    if (ptArr[jDir] > -sidesArr[jDir] - TINY && ptArr[jDir] < sidesArr[jDir] + TINY &&
                        ptArr[kDir] > -sidesArr[kDir] - TINY && ptArr[kDir] < sidesArr[kDir] + TINY) {
                        pt.transform(box.orientation);
                        pt.x += box.position.x;
                        pt.y += box.position.y;
                        pt.z += box.position.z;
                        addPoint(pts, pt, combinationDistanceSq);
                        if (++num === 2) {
                            return num;
                        }
                    }
                }
            }
        }
    }
    return num;
};

const getBox2BoxEdgesIntersectionPoints = (contactPoint, box0, box1, newState, combDistSq) => {
    let num = 0;
    const box0State = newState ? box0.getCurrState() : box0.getOldState();
    const box1State = newState ? box1.getCurrState() : box1.getOldState();
    const boxPts = box1.getCornerPointsInBoxSpace(box1State, box0State);
    const boxEdges = box1.getEdges();
    const sideLengths = box0.getSideLengths();
    for (let i = 0; i < boxEdges.length; ++i) {
        const boxEdge = boxEdges[i];
        const edgePt0 = boxPts[boxEdge.ind0];
        const edgePt1 = boxPts[boxEdge.ind1];
        num += getAABox2EdgeIntersectionPoints(contactPoint, sideLengths, box0State, edgePt0, edgePt1, combDistSq);
        if (num >= 8) return num;
    }
    return num;
};

const getBoxBoxIntersectionPoints = (contactPoint, box0, box1, newState, combinationDistanceSq) => {
    getBox2BoxEdgesIntersectionPoints(contactPoint, box0, box1, newState, combinationDistanceSq);
    getBox2BoxEdgesIntersectionPoints(contactPoint, box1, box0, newState, combinationDistanceSq);
    return contactPoint.length;
};

export default class CollDetectBoxBox {
    constructor() {
        this.name = "BoxBox";

        this.collDetect = function(info, collToll, collisionFunctor) {
            if (!info.body0.hitTestObject3D(info.body1) || !info.body0.getBoundingBox().overlapTest(info.body1.getBoundingBox())) {
                return;
            }

            const dirs0Arr = info.body0.getCurrState().getOrientationCols();
            const dirs1Arr = info.body1.getCurrState().getOrientationCols();

            const axes = [ dirs0Arr[0], dirs0Arr[1], dirs0Arr[2], dirs1Arr[0], dirs1Arr[1], dirs1Arr[2],
                Vector3.cross(dirs0Arr[0], dirs1Arr[0]),
                Vector3.cross(dirs0Arr[0], dirs1Arr[1]),
                Vector3.cross(dirs0Arr[0], dirs1Arr[2]),
                Vector3.cross(dirs0Arr[1], dirs1Arr[0]),
                Vector3.cross(dirs0Arr[1], dirs1Arr[1]),
                Vector3.cross(dirs0Arr[1], dirs1Arr[2]),
                Vector3.cross(dirs0Arr[2], dirs1Arr[0]),
                Vector3.cross(dirs0Arr[2], dirs1Arr[1]),
                Vector3.cross(dirs0Arr[2], dirs1Arr[2]) ];

            const overlapDepths = new Array(15);

            let i, axesLength = axes.length, cpInfo, l2;
            for (i = 0; i < axesLength; i++) {
                l2 = axes[i].lengthSquared;
                if (l2 >= JConfig.NUM_TINY) {
                    overlapDepths[i] = new SpanData();
                    if (disjoint(overlapDepths[i], axes[i], info.body0, info.body1, collToll)) {
                        return;
                    }
                }
            }

            let minDepth = JConfig.NUM_HUGE;
            let minAxis = -1;
            axesLength = axes.length;
            for (i = 0; i < axesLength; i++) {
                l2 = axes[i].lengthSquared;
                if (l2 < JConfig.NUM_TINY) {
                    continue;
                }

                const invl = 1 / Math.sqrt(l2);
                axes[i].scale(invl);
                overlapDepths[i].depth *= invl;

                if (overlapDepths[i].depth < minDepth) {
                    minDepth = overlapDepths[i].depth;
                    minAxis = i;
                }
            }

            if (minAxis === -1) {
                return;
            }

            const N = axes[minAxis];
            if ((info.body1.getCurrState().position.x - info.body0.getCurrState().position.x) * N.x +
                (info.body1.getCurrState().position.y - info.body0.getCurrState().position.y) * N.y +
                (info.body1.getCurrState().position.z - info.body0.getCurrState().position.z) * N.z > 0) {
                N.reverse();
            }

            let contactPointsFromOld = true;
            const contactPoints = [];
            const sideLengthsBox0 = info.body0.getSideLengths();
            const sideLengthsBox1 = info.body1.getSideLengths();
            const combinationDistanceSq = 0.05 * Math.min(Math.min(sideLengthsBox0.x, sideLengthsBox0.y, sideLengthsBox0.z),
                Math.min(sideLengthsBox1.x, sideLengthsBox1.y, sideLengthsBox1.z));

            if (minDepth > -JConfig.NUM_TINY) {
                getBoxBoxIntersectionPoints(contactPoints, info.body0, info.body1, false, combinationDistanceSq);
            }

            if (contactPoints.length === 0) {
                contactPointsFromOld = false;
                getBoxBoxIntersectionPoints(contactPoints, info.body0, info.body1, true, combinationDistanceSq);
            }

            const box0PosSubX = info.body0.getCurrState().position.x - info.body0.getOldState().position.x;
            const box0PosSubY = info.body0.getCurrState().position.y - info.body0.getOldState().position.y;
            const box0PosSubZ = info.body0.getCurrState().position.z - info.body0.getOldState().position.z;
            const box1PosSubX = info.body1.getCurrState().position.x - info.body1.getOldState().position.x;
            const box1PosSubY = info.body1.getCurrState().position.y - info.body1.getOldState().position.y;
            const box1PosSubZ = info.body1.getCurrState().position.z - info.body1.getOldState().position.z;
            const oldDepth = minDepth + ((box0PosSubX - box1PosSubX) * N.x + (box0PosSubY - box1PosSubY) * N.y + (box0PosSubZ - box1PosSubZ) * N.z);

            const SATPoint = new Vector3();
            switch (minAxis) {
                case 0:
                case 1:
                case 2:
                    getSupportPoint(SATPoint, info.body1, new Vector3(-N.x, -N.y, -N.z));
                    break;
                case 3:
                case 4:
                case 5:
                    getSupportPoint(SATPoint, info.body0, N);
                    break;
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12:
                case 13:
                case 14:
                    i = minAxis - 6;
                    const ia = Math.floor(i / 3);
                    const ib = Math.floor(i - ia * 3);
                    const P0 = new Vector3;
                    const P1 = new Vector3;
                    getSupportPoint(P0, info.body0, N);
                    getSupportPoint(P1, info.body1, new Vector3(-N.x, -N.y, -N.z));
                    const planeNormal = Vector3.cross(N, dirs1Arr[ib]);
                    const planeD = Vector3.dot(planeNormal, P1);
                    const div = Vector3.dot(dirs0Arr[ia], planeNormal);
                    if (Math.abs(div) < JConfig.NUM_TINY) {
                        return;
                    }
                    const t = (planeD - Vector3.dot(P0, planeNormal)) / div;
                    P0.x += dirs0Arr[ia].x * t;
                    P0.y += dirs0Arr[ia].y * t;
                    P0.z += dirs0Arr[ia].z * t;
                    SATPoint.x = P0.x + 0.5 * minDepth * N.x;
                    SATPoint.y = P0.y + 0.5 * minDepth * N.y;
                    SATPoint.z = P0.z + 0.5 * minDepth * N.z;
                    break;
            }

            if (contactPoints.length > 0) {
                const collPts = [];
                let minDist = JConfig.NUM_HUGE;
                let maxDist = -JConfig.NUM_HUGE;
                for (let k = 0, len = contactPoints.length; k < len; k++) {
                    const dist = pointPointDistance(contactPoints[k], SATPoint);
                    if (dist < minDist) {
                        minDist = dist;
                    }
                    if (dist > maxDist) {
                        maxDist = dist;
                    }
                }

                if (maxDist < minDist + JConfig.NUM_TINY) {
                    maxDist = minDist + JConfig.NUM_TINY;
                }

                const invdistSize = 1 / (maxDist - minDist);
                for (let k = 0, len = contactPoints.length; k < len; k++) {
                    const contactPoint = contactPoints[k];
                    const depth = 1 - (pointPointDistance(contactPoint, SATPoint) - minDist) * invdistSize;
                    cpInfo = new CollPointInfo();
                    if (contactPointsFromOld) {
                        cpInfo.r0 = contactPoint.minus(info.body0.getOldState().position);
                        cpInfo.r1 = contactPoint.minus(info.body1.getOldState().position);
                    } else {
                        cpInfo.r0 = contactPoint.minus(info.body0.getCurrState().position);
                        cpInfo.r1 = contactPoint.minus(info.body1.getCurrState().position);
                    }
                    cpInfo.initialPenetration = depth * oldDepth;
                    collPts.push(cpInfo);
                }
                collisionFunctor.collisionNotify(info, N, collPts, contactPoints.length);
            } else {
                cpInfo = new CollPointInfo();
                cpInfo.r0 = SATPoint.minus(info.body0.getCurrState().position);
                cpInfo.r1 = SATPoint.minus(info.body1.getCurrState().position);
                cpInfo.initialPenetration = oldDepth;
                collisionFunctor.collisionNotify(info, N, [ cpInfo ], 1);
            }
        };
    }
}

