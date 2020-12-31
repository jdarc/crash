import MaterialProperties from "../data/MaterialProperties";

export default class CollisionInfo {
    constructor() {
        this.mat = new MaterialProperties;
        this.collInfo = null;
        this.dirToBody = null;
        this.pointInfo = [];
        this.satisfied = false;
    }

    init(info, dirToBody0, pointInfos, numPointInfos) {
        const skin0Mat = info.body0.getMaterial();
        const skin1Mat = info.body1.getMaterial();
        this.collInfo = info;
        this.dirToBody = dirToBody0;
        this.mat.restitution = 0.5 * (skin0Mat.restitution + skin1Mat.restitution);
        this.mat.staticFriction = 0.5 * (skin0Mat.staticFriction + skin1Mat.staticFriction);
        this.mat.dynamicFriction = 0.5 * (skin0Mat.dynamicFriction + skin1Mat.dynamicFriction);
        this.pointInfo.length = 0;
        for (let i = 0; i < numPointInfos; ++i) {
            this.pointInfo.push(pointInfos[i]);
        }
    }

    static getCollisionInfo(info, dirToBody0, pointInfos, numPointInfos) {
        const collisionInfo = new CollisionInfo();
        collisionInfo.init(info, dirToBody0, pointInfos, numPointInfos);
        return collisionInfo;
    }
}

