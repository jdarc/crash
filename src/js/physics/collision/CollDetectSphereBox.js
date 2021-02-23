import JConfig from "../JConfig";
import Vector3 from "../../math/Vector3";
import CollPointInfo from "./CollPointInfo";

export default class CollDetectSphereBox {
    constructor() {
        this.name = "SphereBox";

        this.collDetect = function(info, collToll, collisionFunctor) {
            if (info.body0.getType() === "BOX") {
                const tempBody = info.body0;
                info.body0 = info.body1;
                info.body1 = tempBody;
            }

            if (!info.body0.hitTestObject3D(info.body1) || !info.body0.getBoundingBox().overlapTest(info.body1.getBoundingBox())) {
                return;
            }

            const oldBoxPoint = [ new Vector3() ];
            const newBoxPoint = [ new Vector3() ];

            const oldDist = info.body1.getDistanceToPoint(info.body1.getOldState(), oldBoxPoint, info.body0.getOldState().position);
            const newDist = info.body1.getDistanceToPoint(info.body1.getCurrState(), newBoxPoint, info.body0.getCurrState().position);
            const oldDepth = info.body0.radius - oldDist;
            const newDepth = info.body0.radius - newDist;
            if (Math.max(oldDepth, newDepth) > -collToll) {
                let dir;
                if (oldDist < -JConfig.NUM_TINY) {
                    dir = oldBoxPoint[0].minus(info.body0.getOldState().position).minus(oldBoxPoint[0]);
                    dir.normalize();
                } else if (oldDist > JConfig.NUM_TINY) {
                    dir = info.body0.getOldState().position.minus(oldBoxPoint[0]);
                    dir.normalize();
                } else {
                    dir = info.body0.getOldState().position.minus(info.body1.getOldState().position);
                    dir.normalize();
                }
                const collInfo = new CollPointInfo();
                collInfo.r0 = oldBoxPoint[0].minus(info.body0.getOldState().position);
                collInfo.r1 = oldBoxPoint[0].minus(info.body1.getOldState().position);
                collInfo.initialPenetration = oldDepth;
                collisionFunctor.collisionNotify(info, dir, [ collInfo ], 1);
            }
        };
    }
}

