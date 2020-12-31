import JMath3D from "../JMath3D";
import Vector3 from "../math/Vector3";
import CollPointInfo from "./CollPointInfo";
import CollisionInfo from "./CollisionInfo";
import MaterialProperties from "../data/MaterialProperties";
import CollOutData from "../data/CollOutData";
import JSegment from "../geometry/JSegment";
import SpanData from "../data/SpanData";
import JTriangle from "../geometry/JTriangle";

export default class CollDetectBoxMesh {
    constructor() {
        this.name = "BoxMesh";
    }

    disjoint(out, axis, box, triangle, collToll) {
        const obj0 = box.getSpan(axis);
        const obj1 = triangle.getSpan(axis);
        if (obj0.min > (obj1.max + collToll + JMath3D.NUM_TINY) || obj1.min > (obj0.max + collToll + JMath3D.NUM_TINY)) {
            return true;
        }
        if ((obj0.max > obj1.max) && (obj1.min > obj0.min)) {
            out.depth = Math.min(obj0.max - obj1.min, obj1.max - obj0.min);
        } else if ((obj1.max > obj0.max) && (obj0.min > obj1.min)) {
            out.depth = Math.min(obj1.max - obj0.min, obj0.max - obj1.min);
        } else {
            out.depth = Math.min(obj0.max, obj1.max);
            out.depth -= Math.max(obj0.min, obj1.min);
        }
        return false;
    }

    addPoint(contactPoints, pt, combinationDistanceSq) {
        let contactPoints_i = 0;
        let contactPoint;
        for (; (contactPoints_i < contactPoints.length) && (contactPoint = contactPoints[contactPoints_i]); contactPoints_i++) {
            if (contactPoint.subtract(pt).getLengthSquared() < combinationDistanceSq) {
                contactPoint = new Vector3(contactPoint.add(pt).x * 0.5, contactPoint.add(pt).y * 0.5,
                    contactPoint.add(pt).z * 0.5);
                return false;
            }
        }
        contactPoints.push(pt);
        return true;
    }

    getBoxTriangleIntersectionPoints(pts, box, triangle, combinationDistanceSq) {
        const data = new CollOutData();
        const edges = box.getEdges();
        const boxPts = box.getCornerPoints(box.getCurrState());

        for (let i = 0; i < 12; i++) {
            const edge = edges[i];
            let data = new CollOutData();
            const seg = new JSegment(boxPts[edge.ind0], boxPts[edge.ind1].subtract(boxPts[edge.ind0]));
            if (triangle.segmentTriangleIntersection(data, seg)) {
                this.addPoint(pts, seg.getPoint(data.frac), combinationDistanceSq);
                if (pts.length > 8) {
                    return pts.length;
                }
            }
        }

        for (let i = 0; i < 3; i++) {
            const pt0 = triangle.getVertex(i);
            const pt1 = triangle.getVertex((i + 1) % 3);
            if (box.segmentIntersect(data, new JSegment(pt0, pt1.subtract(pt0)), box.getCurrState())) {
                this.addPoint(pts, data.position, combinationDistanceSq);
                if (pts.length > 8) {
                    return pts.length;
                }
            }
            if (box.segmentIntersect(data, new JSegment(pt1, pt0.subtract(pt1)), box.getCurrState())) {
                this.addPoint(pts, data.position, combinationDistanceSq);
                if (pts.length > 8) {
                    return pts.length;
                }
            }
        }
        return pts.length;
    }

    doOverlapBoxTriangleTest(box, triangle, mesh, info, collArr, collTolerance) {
        const dirs0 = box.getCurrState().getOrientationCols();
        const tri = new JTriangle(mesh.get_octree().getVertex(triangle.getVertexIndex(0)), mesh.get_octree().getVertex(triangle.getVertexIndex(1)), mesh.get_octree().getVertex(triangle.getVertexIndex(2)));
        const triEdge0 = tri.getVertex(1).subtract(tri.getVertex(0));
        triEdge0.normalize();
        const triEdge1 = tri.getVertex(2).subtract(tri.getVertex(1));
        triEdge1.normalize();
        const triEdge2 = tri.getVertex(0).subtract(tri.getVertex(2));
        triEdge2.normalize();
        const triNormal = triangle.get_plane().getNormal().clone();
        const numAxes = 13;
        const axes = [triNormal, dirs0[0], dirs0[1], dirs0[2],
            dirs0[0].cross(triEdge0),
            dirs0[0].cross(triEdge1),
            dirs0[0].cross(triEdge2),
            dirs0[1].cross(triEdge0),
            dirs0[1].cross(triEdge1),
            dirs0[1].cross(triEdge2),
            dirs0[2].cross(triEdge0),
            dirs0[2].cross(triEdge1),
            dirs0[2].cross(triEdge2)];

        const overlapDepths = [];
        for (let i = 0; i < numAxes; i++) {
            overlapDepths[i] = new SpanData();
            if (this.disjoint(overlapDepths[i], axes[i], box, tri, collTolerance)) {
                return false;
            }
        }

        let minAxis = -1;
        let minDepth = JMath3D.NUM_HUGE, invl, depth, combinationDist, oldDepth;

        for (let i = 0; i < numAxes; i++) {
            const l2 = axes[i].getLengthSquared();
            if (l2 < JMath3D.NUM_TINY) {
                continue;
            }

            invl = 1 / Math.sqrt(l2);
            axes[i].scaleBy(invl);
            overlapDepths[i].depth *= invl;

            if (overlapDepths[i].depth < minDepth) {
                minDepth = overlapDepths[i].depth;
                minAxis = i;
            }
        }

        if (minAxis === -1) {
            return false;
        }

        const D = box.getCurrState().position.subtract(tri.getCentre());
        const N = axes[minAxis];
        depth = overlapDepths[minAxis].depth;

        if (D.dot(N) < 0) {
            N.negate();
        }

        const boxOldPos = box.getOldState().position;
        const boxNewPos = box.getCurrState().position;
        const meshPos = mesh.getCurrState().position;
        const pts = [];
        combinationDist = depth + 0.05;
        this.getBoxTriangleIntersectionPoints(pts, box, tri, combinationDist * combinationDist);

        const delta = boxNewPos.subtract(boxOldPos);
        oldDepth = depth + delta.dot(N);

        const numPts = pts.length;
        const collPts = [];
        if (numPts > 0) {
            let cpInfo;
            for (let i = 0; i < numPts; i++) {
                cpInfo = new CollPointInfo();
                cpInfo.r0 = pts[i].subtract(boxNewPos);
                cpInfo.r1 = pts[i].subtract(meshPos);
                cpInfo.initialPenetration = oldDepth;
                collPts[i] = cpInfo;
            }

            const collInfo = new CollisionInfo();
            collInfo.collInfo = info;
            collInfo.dirToBody = N;
            collInfo.pointInfo = collPts;

            const mat = new MaterialProperties();
            mat.restitution = 0.5 * (box.getMaterial().restitution + mesh.getMaterial().restitution);
            mat.staticFriction = 0.5 * (box.getMaterial().staticFriction + mesh.getMaterial().staticFriction);
            collInfo.mat = mat;
            collArr.push(collInfo);
            info.body0._collisions.push(collInfo);
            info.body1._collisions.push(collInfo);
            return true;
        }
    }

    collDetectBoxStaticMeshOverlap(box, mesh, info, collArr, collTolerance) {
        const boxRadius = box.getBoundingSphere();
        const boxCentre = box.getCurrState().position;

        const potentialTriangles = [];
        const numTriangles = mesh.get_octree().getTrianglesIntersectingtAABox(potentialTriangles, box.getBoundingBox());

        let collision = false;
        let dist;
        let meshTriangle;
        for (let iTriangle = 0; iTriangle < numTriangles; ++iTriangle) {
            meshTriangle = mesh.get_octree().getTriangle(potentialTriangles[iTriangle]);

            dist = meshTriangle.get_plane().pointPlaneDistance(boxCentre);
            if (dist > boxRadius || dist < 0) {
                continue;
            }

            if (this.doOverlapBoxTriangleTest(box, meshTriangle, mesh, info, collArr, collTolerance)) {
                collision = true;
            }
        }

        return collision;
    }

    collDetect(info, collArr, collTolerance) {
        let tempBody;
        if (info.body0.getType() === "TRIANGLEMESH") {
            tempBody = info.body0;
            info.body0 = info.body1;
            info.body1 = tempBody;
        }
        const box = info.body0;
        const mesh = info.body1;
        this.collDetectBoxStaticMeshOverlap(box, mesh, info, collArr, collTolerance);
    }
}

