import JMath3D from "../JMath3D";
import RigidBody from "../physics/RigidBody";
import Vector3 from "../math/Vector3";
import TerrainData from "../data/TerrainData";
import PlaneData from "../data/PlaneData";

export default class JTerrain extends RigidBody {
    constructor(tr) {
        super();
        this._terrain = tr;
        this.setMovable(false);
        this._type = "TERRAIN";
    }

    get_terrainMesh() {
        return this._terrain;
    }

    getHeightByIndex(i, j) {
        return this._terrain.get_heights(Math.max(0, Math.min(this._terrain.get_sw(), i)) | 0,
            Math.max(0, Math.min(this._terrain.get_sh(), j)) | 0);
    }

    getHeightAndNormalByPoint(point) {
        const xmin = this._terrain.get_minW();
        const xmax = this._terrain.get_maxW();
        const zmin = this._terrain.get_minH();
        const zmax = this._terrain.get_maxH();
        const dx = this._terrain.get_dw();
        const dz = this._terrain.get_dh();
        const nx = this._terrain.get_sw();
        const nz = this._terrain.get_sh();

        let x = point.x;
        let z = point.z;

        x = Math.max(xmin, Math.min(xmax, x));
        z = Math.max(zmin, Math.min(zmax, z));

        let i0 = (x - xmin) / dx | 0;
        let j0 = (z - zmin) / dz | 0;

        i0 = Math.max(0, Math.min(nx - 1, i0)) | 0;
        j0 = Math.max(0, Math.min(nz - 1, j0)) | 0;

        let i1 = i0 + 1;
        let j1 = j0 + 1;

        if (i1 >= nx) {
            i1 = nx - 1;
        }
        if (j1 >= nz) {
            j1 = nz - 1;
        }

        let iFrac = (x - (i0 * dx + xmin)) / dx;
        let jFrac = (z - (j0 * dz + zmin)) / dz;

        iFrac = Math.max(0, Math.min(1, iFrac));
        jFrac = Math.max(0, Math.min(1, jFrac));

        const h00 = this._terrain.get_heights(i0, j0);
        const h01 = this._terrain.get_heights(i0, j1);
        const h10 = this._terrain.get_heights(i1, j0);
        const h11 = this._terrain.get_heights(i1, j1);

        const obj = new TerrainData();
        const plane = new PlaneData();

        if (iFrac < jFrac || i0 === i1 || j0 === j1) {
            obj.normal = new Vector3(0, h11 - h10, dz).cross(new Vector3(dx, h11 - h01, 0));
            plane.setWithNormal(new Vector3(i1 * dx + xmin, h11, j1 * dz + zmin), obj.normal);
        } else {
            obj.normal = new Vector3(0, h01 - h00, dz).cross(new Vector3(dx, h10 - h00, 0));
            plane.setWithNormal(new Vector3(i0 * dx + xmin, h00, j0 * dz + zmin), obj.normal);
        }

        obj.height = plane.pointPlaneDistance(point);
        obj.normal.normalize();
        return obj;
    }

    getHeightByPoint(point) {
        return this.getHeightAndNormalByPoint(point).height;
    }

    getNormalByPoint(point) {
        return this.getHeightAndNormalByPoint(point).normal;
    }

    getSurfacePosByPoint(point) {
        return new Vector3(point.x, this.getHeightAndNormalByPoint(point).height, point.z);
    }

    segmentIntersect(out, seg, state) {
        out.frac = 0;
        out.position = new Vector3();
        out.normal = new Vector3();

        if (seg.delta.y > -JMath3D.NUM_TINY) {
            return false;
        }

        const obj1 = this.getHeightAndNormalByPoint(seg.origin);
        if (obj1.height < 0) {
            return false;
        }

        const obj2 = this.getHeightAndNormalByPoint(seg.getEnd());
        if (obj2.height > 0) {
            return false;
        }

        const depthEnd = -obj2.height;
        const weightStart = 1 / (JMath3D.NUM_TINY + obj1.height);
        const weightEnd = 1 / (JMath3D.NUM_TINY + obj2.height);

        obj1.normal.scaleBy(weightStart);
        obj2.normal.scaleBy(weightEnd);
        out.normal = obj1.normal.add(obj2.normal);
        out.normal.scaleBy(1 / (weightStart + weightEnd));

        out.frac = obj1.height / (obj1.height + depthEnd + JMath3D.NUM_TINY);
        out.position = seg.getPoint(out.frac);

        return true;
    }
}
