import Vector3 from "../math/Vector3";
import CollPointInfo from "./CollPointInfo";
import CollisionInfo from "./CollisionInfo";
import MaterialProperties from "../data/MaterialProperties";

export default class CollDetectSphereTerrain {
    constructor() {
        this.name = "SphereTerrain";
    }

    collDetect(info, collArr, collToll) {
        if (info.body0.getType() === "TERRAIN") {
            const tempBody = info.body0;
            info.body0 = info.body1;
            info.body1 = tempBody;
        }

        const obj = info.body1.getHeightAndNormalByPoint(info.body0.getCurrState().position);
        if (obj.height < collToll + info.body0.get_radius()) {
            const dist = info.body1.getHeightByPoint(info.body0.getOldState().position);
            const depth = info.body0.get_radius() - dist;

            const Pt = info.body0.getOldState().position.subtract(new Vector3(obj.normal.x * info.body0.get_radius(), obj.normal.y * info.body0.get_radius(), obj.normal.z * info.body0.get_radius()));
            const collPts = [];
            const cpInfo = new CollPointInfo();
            cpInfo.r0 = Pt.subtract(info.body0.getOldState().position);
            cpInfo.r1 = Pt.subtract(info.body1.getOldState().position);
            cpInfo.initialPenetration = depth;
            collPts[0] = cpInfo;

            const collInfo = new CollisionInfo();
            collInfo.collInfo = info;
            collInfo.dirToBody = obj.normal;
            collInfo.pointInfo = collPts;

            const mat = new MaterialProperties();
            mat.restitution = 0.5 * (info.body0.getMaterial().restitution + info.body1.getMaterial().restitution);
            mat.staticFriction = 0.5 * (info.body0.getMaterial().staticFriction + info.body1.getMaterial().staticFriction);
            collInfo.mat = mat;
            collArr.push(collInfo);
            info.body0._collisions.push(collInfo);
            info.body1._collisions.push(collInfo);
        }
    }
}

