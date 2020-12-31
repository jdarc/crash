import CollPointInfo from "./CollPointInfo";

export default class CollDetectBoxPlane {
    constructor() {
        this.name = "BoxPlane";

        this.collDetect = function(info, collToll, collisionFunctor) {
            if (info.body0.getType() === "PLANE") {
                const tempBody = info.body0;
                info.body0 = info.body1;
                info.body1 = tempBody;
            }

            const box = info.body0;
            const plane = info.body1;

            const centreDist = plane.pointPlaneDistance(box.getCurrState().position);
            if (centreDist > box.getBoundingSphere() + collToll) {
                return;
            }

            const newPts = box.getCornerPoints(box.getCurrState());
            const oldPts = box.getCornerPoints(box.getOldState());
            const collPts = [];
            for (let i = 0; i < 8; i++) {
                const newPt = newPts[i];
                const oldPt = oldPts[i];
                const newDepth = -1 * plane.pointPlaneDistance(newPt);
                const oldDepth = -1 * plane.pointPlaneDistance(oldPt);
                if (Math.max(newDepth, oldDepth) > -collToll) {
                    const cpInfo = new CollPointInfo();
                    cpInfo.r0 = oldPt.subtract(box.getOldState().position);
                    cpInfo.r1 = oldPt.subtract(plane.getOldState().position);
                    cpInfo.initialPenetration = oldDepth;
                    collPts.push(cpInfo);
                }
            }

            if (collPts.length > 0) {
                collisionFunctor.collisionNotify(info, plane.getNormal().clone(), collPts, collPts.length);
            }
        };
    }
}

