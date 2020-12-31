import JMath3D from "../JMath3D";
import Vector3 from "../math/Vector3";
import JTriangle from "../geometry/JTriangle";
import CollPointInfo from "./CollPointInfo";
import CollisionInfo from "./CollisionInfo";
import MaterialProperties from "../data/MaterialProperties";

export default class CollDetectSphereMesh {
    constructor() {
        this.name = "SphereMesh";
    }

    collDetectSphereStaticMeshOverlap(sphere, mesh, info, collToll, collArr) {
        const body0Pos = info.body0.getOldState().position;
        const body1Pos = info.body1.getOldState().position;

        const sphereTolR = collToll + sphere.get_radius();
        const sphereTolR2 = sphereTolR * sphereTolR;

        let collNormal = new Vector3();
        const collPts = [];

        const potentialTriangles = [];
        const numTriangles = mesh.get_octree().getTrianglesIntersectingtAABox(potentialTriangles, sphere.getBoundingBox());

        for (let iTriangle = 0; iTriangle < numTriangles; ++iTriangle) {
            const meshTriangle = mesh.get_octree().getTriangle(potentialTriangles[iTriangle]);
            const distToCentre = meshTriangle.get_plane().pointPlaneDistance(sphere.getCurrState().position);
            if (distToCentre <= 0) {
                continue;
            }
            if (distToCentre >= sphereTolR) {
                continue;
            }

            const vertexIndices = meshTriangle.get_vertexIndices();
            const triangle = new JTriangle(mesh.get_octree().getVertex(vertexIndices[0]), mesh.get_octree().getVertex(vertexIndices[1]), mesh.get_octree().getVertex(vertexIndices[2]));
            const arr = [];
            const newD2 = triangle.pointTriangleDistanceSq(arr, sphere.getCurrState().position);
            if (newD2 < sphereTolR2) {

                const oldD2 = triangle.pointTriangleDistanceSq(arr, sphere.getOldState().position);
                const dist = Math.sqrt(oldD2);
                const depth = sphere.get_radius() - dist;
                const collisionN = (dist > JMath3D.NUM_TINY) ? (sphere.getOldState().position.subtract(triangle.getPoint(arr[0], arr[1]))) : triangle.getNormal().clone();
                collisionN.normalize();

                const pt = sphere.getOldState().position.subtract(new Vector3(collisionN.x * sphere.get_radius(), collisionN.y * sphere.get_radius(), collisionN.z * sphere.get_radius()));
                const cpInfo = new CollPointInfo();
                cpInfo.r0 = pt.subtract(body0Pos);
                cpInfo.r1 = pt.subtract(body1Pos);
                cpInfo.initialPenetration = depth;
                collPts.push(cpInfo);
                collNormal = collNormal.add(collisionN);
                collNormal.normalize();
            }
        }
        if (collPts.length > 0) {
            const collInfo = new CollisionInfo();
            collInfo.collInfo = info;
            collInfo.dirToBody = collNormal;
            collInfo.pointInfo = collPts;

            const mat = new MaterialProperties();
            mat.restitution = 0.5 * (sphere.getMaterial().restitution + mesh.getMaterial().restitution);
            mat.staticFriction = 0.5 * (sphere.getMaterial().staticFriction + mesh.getMaterial().staticFriction);
            collInfo.mat = mat;
            collArr.push(collInfo);
            info.body0._collisions.push(collInfo);
            info.body1._collisions.push(collInfo);
        }
    }

    collDetect(info, collArr, collToll) {
        let tempBody;
        if (info.body0.getType() === "TRIANGLEMESH") {
            tempBody = info.body0;
            info.body0 = info.body1;
            info.body1 = tempBody;
        }
        this.collDetectSphereStaticMeshOverlap(info.body0, info.body1, info, collToll, collArr);
    }
}

