import CollPointInfo from "./CollPointInfo";
import Vector3 from "../../math/Vector3";

export default class CollDetectBoxPlane {
    constructor() {
        this.name = "BoxPlane";

        this.collDetect = function(info, collToll, collisionFunctor) {
            if (info.body0.getType() === "PLANE") {
                const tempBody = info.body0;
                info.body0 = info.body1;
                info.body1 = tempBody;
            }

            if (info.body1.pointPlaneDistance(info.body0.getCurrState().position) > info.body0.getBoundingSphere() + collToll) {
                return;
            }

            const newPts = info.body0.getCornerPoints(info.body0.getCurrState());
            const oldPts = info.body0.getCornerPoints(info.body0.getOldState());
            const collPts = [];
            for (let i = 0; i < 8; i++) {
                const newDepth = -1 * info.body1.pointPlaneDistance(newPts[i]);
                const oldDepth = -1 * info.body1.pointPlaneDistance(oldPts[i]);
                if (Math.max(newDepth, oldDepth) > -collToll) {
                    const cpInfo = new CollPointInfo();
                    cpInfo.r0 = oldPts[i].minus(info.body0.getOldState().position);
                    cpInfo.r1 = oldPts[i].minus(info.body1.getOldState().position);
                    cpInfo.initialPenetration = oldDepth;
                    collPts.push(cpInfo);
                }
            }

            if (collPts.length > 0) {
                collisionFunctor.collisionNotify(info, new Vector3(info.body1.getNormal()), collPts, collPts.length);
            }
        };
    }
}

