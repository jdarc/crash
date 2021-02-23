import Vector3 from "../../math/Vector3";
import CollPointInfo from "./CollPointInfo";

export default class CollDetectSpherePlane {
    constructor() {
        this.name = "SpherePlane";
    }

    collDetect(info, collTolerance, collisionFunctor) {
        if (info.body0.getType() === "PLANE") {
            const tempBody = info.body0;
            info.body0 = info.body1;
            info.body1 = tempBody;
        }

        const oldPosition = info.body0.getOldState().position;
        const currentPosition = info.body0.getCurrState().position;
        const radius = info.body0.radius;
        const oldDist = info.body1.pointPlaneDistance(oldPosition);
        const newDist = info.body1.pointPlaneDistance(currentPosition);
        const oldPlanePosition = info.body1.getOldState().position;
        if (Math.min(newDist, oldDist) > info.body0.getBoundingSphere() + collTolerance) return;

        const depth = radius - oldDist;
        const normal = info.body1.getNormal();
        const worldPos = oldPosition.minus(new Vector3(normal.x * radius, normal.y * radius, normal.z * radius));

        const collInfo = new CollPointInfo();
        collInfo.r0 = worldPos.minus(oldPosition);
        collInfo.r1 = worldPos.minus(oldPlanePosition);
        collInfo.initialPenetration = depth;
        collisionFunctor.collisionNotify(info, new Vector3(normal), [ collInfo ], 1);
    }
}
