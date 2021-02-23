import CollOutBodyData from "../data/CollOutBodyData";
import CollDetectBoxBox from "./CollDetectBoxBox";
import CollDetectSphereBox from "./CollDetectSphereBox";
import CollDetectBoxPlane from "./CollDetectBoxPlane";
import CollDetectSphereSphere from "./CollDetectSphereSphere";
import CollDetectSpherePlane from "./CollDetectSpherePlane";
import Vector3 from "../../math/Vector3";
import JConfig from "../JConfig";

export default class CollisionSystem {
    constructor() {
        this.collBody = [];
        this.detectionFunctors = [];
        this.detectionFunctors["BOX_BOX"] = new CollDetectBoxBox();
        this.detectionFunctors["BOX_SPHERE"] = new CollDetectSphereBox();
        this.detectionFunctors["BOX_PLANE"] = new CollDetectBoxPlane();
        this.detectionFunctors["SPHERE_BOX"] = new CollDetectSphereBox();
        this.detectionFunctors["SPHERE_SPHERE"] = new CollDetectSphereSphere();
        this.detectionFunctors["SPHERE_PLANE"] = new CollDetectSpherePlane();
        this.detectionFunctors["PLANE_BOX"] = new CollDetectBoxPlane();
        this.detectionFunctors["PLANE_SPHERE"] = new CollDetectSpherePlane();
        this.detectionFunctors["SPHERE_BOX"] = new CollDetectSphereBox();
        this.detectionFunctors["SPHERE_SPHERE"] = new CollDetectSphereSphere();
        this.detectionFunctors["SPHERE_PLANE"] = new CollDetectSpherePlane();
        this.detectionFunctors["PLANE_BOX"] = new CollDetectBoxPlane();
        this.detectionFunctors["PLANE_SPHERE"] = new CollDetectSpherePlane();
    }

    addCollisionBody(body) {
        if (this.collBody.indexOf(body) < 0) {
            this.collBody.push(body);
        }
    }

    removeCollisionBody(body) {
        if (this.collBody.indexOf(body) >= 0) {
            this.collBody.splice(this.collBody.indexOf(body), 1);
        }
    }

    removeAllCollisionBodies() {
        this.collBody.length = 0;
    }

    segmentIntersect(out, seg, ownerBody) {
        out.frac = JConfig.NUM_HUGE;
        out.position = new Vector3();
        out.normal = new Vector3();

        const obj = new CollOutBodyData();
        for (let i = 0, len = this.collBody.length; i < len; i++) {
            const colBody = this.collBody[i];
            if (colBody !== ownerBody && this.segmentBounding(seg, colBody)) {
                if (colBody.segmentIntersect(obj, seg, colBody.getCurrState())) {
                    if (obj.frac < out.frac) {
                        out.position = obj.position;
                        out.normal = obj.normal;
                        out.frac = obj.frac;
                        out.rigidBody = colBody;
                    }
                }
            }
        }

        if (out.frac > 1) return false;
        if (out.frac < 0) out.frac = 0; else if (out.frac > 1) out.frac = 1;
        return true;
    }

    segmentBounding(seg, obj) {
        const objPos = obj.getCurrState().position;
        const x = seg.origin.x + seg.direction.x * 0.5 - objPos.x;
        const y = seg.origin.y + seg.direction.y * 0.5 - objPos.y;
        const z = seg.origin.z + seg.direction.z * 0.5 - objPos.z;
        return Math.sqrt(x * x + y * y + z * z) <= seg.direction.length * 0.5 + obj.getBoundingSphere();
    }

    checkCollidables(body0, body1) {
        if (body0.getNonCollidables().length === 0 && body1.getNonCollidables().length === 0) return true;
        if (body0.getNonCollidables().indexOf(body1) > -1) return false;
        return body1.getNonCollidables().indexOf(body0) <= -1;
    }
}
