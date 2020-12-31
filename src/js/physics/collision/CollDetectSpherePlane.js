import Vector3 from "../math/Vector3";
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

        const sphere = info.body0;
        const plane = info.body1;

        const oldPosition = sphere.getOldState().position;
        const currentPosition = sphere.getCurrState().position;
        const radius = sphere.get_radius();
        const oldDist = plane.pointPlaneDistance(oldPosition);
        const newDist = plane.pointPlaneDistance(currentPosition);
        const oldPlanePosition = plane.getOldState().position;
        if (Math.min(newDist, oldDist) > sphere.getBoundingSphere() + collTolerance) return;

        const depth = radius - oldDist;
        const normal = plane.getNormal();
        const worldPos = oldPosition.subtract(new Vector3(normal.x * radius, normal.y * radius, normal.z * radius));
        const collInfo = new CollPointInfo();
        collInfo.r0 = worldPos.subtract(oldPosition);
        collInfo.r1 = worldPos.subtract(oldPlanePosition);
        collInfo.initialPenetration = depth;
        collisionFunctor.collisionNotify(info, normal.clone(), [collInfo], 1);
    }
}

