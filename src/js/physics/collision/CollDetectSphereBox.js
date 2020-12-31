import JMath3D from "../JMath3D";
import Vector3 from "../math/Vector3";
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

            const sphere = info.body0;
            const box = info.body1;

            if (!sphere.hitTestObject3D(box)) {
                return;
            }
            if (!sphere.getBoundingBox().overlapTest(box.getBoundingBox())) {
                return;
            }

            const oldBoxPoint = [new Vector3()];
            const newBoxPoint = [new Vector3()];

            const oldDist = box.getDistanceToPoint(box.getOldState(), oldBoxPoint, sphere.getOldState().position);
            const newDist = box.getDistanceToPoint(box.getCurrState(), newBoxPoint, sphere.getCurrState().position);
            const _oldBoxPosition = oldBoxPoint[0];

            const oldDepth = sphere.get_radius() - oldDist;
            const newDepth = sphere.get_radius() - newDist;
            if (Math.max(oldDepth, newDepth) > -collToll) {
                let dir;
                if (oldDist < -JMath3D.NUM_TINY) {
                    dir = _oldBoxPosition.subtract(sphere.getOldState().position).subtract(_oldBoxPosition);
                    dir.normalize();
                } else if (oldDist > JMath3D.NUM_TINY) {
                    dir = sphere.getOldState().position.subtract(_oldBoxPosition);
                    dir.normalize();
                } else {
                    dir = sphere.getOldState().position.subtract(box.getOldState().position);
                    dir.normalize();
                }

                const collInfo = new CollPointInfo();
                collInfo.r0 = _oldBoxPosition.subtract(sphere.getOldState().position);
                collInfo.r1 = _oldBoxPosition.subtract(box.getOldState().position);
                collInfo.initialPenetration = oldDepth;
                collisionFunctor.collisionNotify(info, dir, [collInfo], 1);
            }
        };
    }
}

