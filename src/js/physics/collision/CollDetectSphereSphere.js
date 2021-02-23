import JConfig from "../JConfig";
import Vector3 from "../../math/Vector3";
import CollPointInfo from "./CollPointInfo";
import Matrix4 from "../../math/Matrix4";

export default class CollDetectSphereSphere {
    constructor() {
        this.name = "SphereSphere";
    }

    collDetect(info, collToll, collisionFunctor) {
        const radius0 = info.body0.radius;
        const oldState0 = info.body0.getOldState();
        const currState0 = info.body0.getCurrState();

        const radius1 = info.body1.radius;
        const oldState1 = info.body1.getOldState();
        const currState1 = info.body1.getCurrState();

        let oldDelta = oldState0.position.minus(oldState1.position);
        const newDelta = currState0.position.minus(currState1.position);
        const oldDistSq = oldDelta.lengthSquared;
        const newDistSq = newDelta.lengthSquared;
        const radSum = radius0 + radius1;

        if (Math.min(oldDistSq, newDistSq) < Math.pow(radSum + collToll, 2)) {
            const oldDist = Math.sqrt(oldDistSq);
            const depth = radSum - oldDist;
            if (oldDist > JConfig.NUM_TINY) {
                oldDelta = new Vector3(oldDelta.x / oldDist, oldDelta.y / oldDist, oldDelta.z / oldDist);
            } else {
                const appendRotation = new Matrix4().rotate(360 * Math.random(), new Vector3(0, 0, 1));
                oldDelta = new Vector3(0, 1, 0).transform(appendRotation);
            }

            const worldPos = oldState1.position.plus(new Vector3(oldDelta.x * radius1 - 0.5 * depth, oldDelta.y * radius1 - 0.5 * depth, oldDelta.z * radius1 - 0.5 * depth));
            const collInfo = new CollPointInfo();
            collInfo.r0 = worldPos.minus(oldState0.position);
            collInfo.r1 = worldPos.minus(oldState1.position);
            collInfo.initialPenetration = depth;
            collisionFunctor.collisionNotify(info, oldDelta, [ collInfo ], 1);
        }
    }
}

