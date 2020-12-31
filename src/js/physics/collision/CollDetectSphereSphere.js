import JMath3D from "../JMath3D";
import Vector3 from "../math/Vector3";
import CollPointInfo from "./CollPointInfo";
import Matrix44 from "../math/Matrix44";

export default class CollDetectSphereSphere {
    constructor() {
        this.name = "SphereSphere";
    }

    collDetect(info, collToll, collisionFunctor) {
        const sphere0 = info.body0;
        const radius0 = sphere0.get_radius();
        const oldState0 = sphere0.getOldState();
        const currState0 = sphere0.getCurrState();

        const sphere1 = info.body1;
        const radius1 = sphere1.get_radius();
        const oldState1 = sphere1.getOldState();
        const currState1 = sphere1.getCurrState();

        let oldDelta = oldState0.position.subtract(oldState1.position);
        const newDelta = currState0.position.subtract(currState1.position);
        const oldDistSq = oldDelta.getLengthSquared();
        const newDistSq = newDelta.getLengthSquared();
        const radSum = radius0 + radius1;

        if (Math.min(oldDistSq, newDistSq) < JMath3D.sq(radSum + collToll)) {
            const oldDist = Math.sqrt(oldDistSq);
            const depth = radSum - oldDist;
            if (oldDist > JMath3D.NUM_TINY) {
                oldDelta = new Vector3(oldDelta.x / oldDist, oldDelta.y / oldDist, oldDelta.z / oldDist);
            } else {
                const appendRotation = new Matrix44().appendRotation(360 * Math.random(), new Vector3(0, 0, 1));
                oldDelta = appendRotation.transformVector(Vector3.Y_AXIS);
            }

            const worldPos = oldState1.position.add(new Vector3(oldDelta.x * radius1 - 0.5 * depth, oldDelta.y * radius1 - 0.5 * depth, oldDelta.z * radius1 - 0.5 * depth));
            const collInfo = new CollPointInfo();
            collInfo.r0 = worldPos.subtract(oldState0.position);
            collInfo.r1 = worldPos.subtract(oldState1.position);
            collInfo.initialPenetration = depth;
            collisionFunctor.collisionNotify(info, oldDelta, [collInfo], 1);
        }
    }
}

