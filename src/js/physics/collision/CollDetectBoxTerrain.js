import Vector3 from "../math/Vector3";
import CollisionInfo from "./CollisionInfo";
import MaterialProperties from "../data/MaterialProperties";
import CollPointInfo from "./CollPointInfo";

export default class CollDetectBoxTerrain {
    constructor() {
        this.name = "BoxTerrain";

        this.collDetect = function(info, collArr, collToll) {
            if (info.body0.getType() === "TERRAIN") {
                const tempBody = info.body0;
                info.body0 = info.body1;
                info.body1 = tempBody;
            }

            const box = info.body0;
            const terrain = info.body1;

            const oldPts = box.getCornerPoints(box.getOldState());
            const newPts = box.getCornerPoints(box.getCurrState());
            let collNormal = new Vector3();
            const collPts = [];
            for (let i = 0; i < 8; i++) {
                let newPt = newPts[i];
                let obj = terrain.getHeightAndNormalByPoint(newPt);
                if (obj.height < collToll) {
                    let oldPt = oldPts[i];
                    let dist = terrain.getHeightByPoint(oldPt);
                    collNormal = collNormal.add(obj.normal);
                    let cpInfo = new CollPointInfo();
                    cpInfo.r0 = oldPt.subtract(box.getOldState().position);
                    cpInfo.r1 = oldPt.subtract(terrain.getOldState().position);
                    cpInfo.initialPenetration = -dist;
                    collPts.push(cpInfo);
                }
            }

            if (collPts.length > 0) {
                collNormal.normalize();

                const collInfo = new CollisionInfo();
                collInfo.collInfo = info;
                collInfo.dirToBody = collNormal;
                collInfo.pointInfo = collPts;

                const mat = new MaterialProperties();
                mat.restitution = 0.5 * (box.getMaterial().restitution + terrain.getMaterial().restitution);
                mat.staticFriction = 0.5 * (box.getMaterial().staticFriction + terrain.getMaterial().staticFriction);
                collInfo.mat = mat;
                collArr.push(collInfo);
                info.body0._collisions.push(collInfo);
                info.body1._collisions.push(collInfo);
            }
        };
    }
}

