import JConfig from "../JConfig";
import Vector3 from "../../math/Vector3";
import EdgeData from "../data/EdgeData";

export default class JAABox {
    constructor() {
        this.minPos = new Vector3;
        this.maxPos = new Vector3;
        this.clear();
    }

    getSideLengths() {
        return new Vector3(this.maxPos).minus(this.minPos);
    }

    getEdges() {
        return [
            new EdgeData(0, 1), new EdgeData(0, 2), new EdgeData(0, 6),
            new EdgeData(2, 3), new EdgeData(2, 4), new EdgeData(6, 7),
            new EdgeData(6, 4), new EdgeData(1, 3), new EdgeData(1, 7),
            new EdgeData(3, 5), new EdgeData(7, 5), new EdgeData(4, 5)
        ];
    }

    move(delta) {
        this.minPos.plus(delta);
        this.maxPos.plus(delta);
    }

    clear() {
        this.minPos = new Vector3(JConfig.NUM_HUGE, JConfig.NUM_HUGE, JConfig.NUM_HUGE);
        this.maxPos = new Vector3(-JConfig.NUM_HUGE, -JConfig.NUM_HUGE, -JConfig.NUM_HUGE);
    }

    clone() {
        const aabb = new JAABox();
        aabb.minPos = new Vector3(this.minPos);
        aabb.maxPos = new Vector3(this.maxPos);
        return aabb;
    }

    addPoint(pos) {
        if (pos.x < this.minPos.x) this.minPos.x = pos.x - JConfig.NUM_TINY;
        if (pos.x > this.maxPos.x) this.maxPos.x = pos.x + JConfig.NUM_TINY;
        if (pos.y < this.minPos.y) this.minPos.y = pos.y - JConfig.NUM_TINY;
        if (pos.y > this.maxPos.y) this.maxPos.y = pos.y + JConfig.NUM_TINY;
        if (pos.z < this.minPos.z) this.minPos.z = pos.z - JConfig.NUM_TINY;
        if (pos.z > this.maxPos.z) this.maxPos.z = pos.z + JConfig.NUM_TINY;
    }

    addBox(box) {
        const pts = box.getCornerPoints(box.getCurrState());
        this.addPoint(pts[0]);
        this.addPoint(pts[1]);
        this.addPoint(pts[2]);
        this.addPoint(pts[3]);
        this.addPoint(pts[4]);
        this.addPoint(pts[5]);
        this.addPoint(pts[6]);
        this.addPoint(pts[7]);
    }

    addSphere(sphere) {
        const position = sphere.getCurrState().position;
        const radius = sphere.radius;
        if (position.x - radius < this.minPos.x) {
            this.minPos.x = position.x - radius - JConfig.NUM_TINY;
        }
        if (position.x + radius > this.maxPos.x) {
            this.maxPos.x = position.x + radius + JConfig.NUM_TINY;
        }
        if (position.y - radius < this.minPos.y) {
            this.minPos.y = position.y - radius - JConfig.NUM_TINY;
        }
        if (position.y + radius > this.maxPos.y) {
            this.maxPos.y = position.y + radius + JConfig.NUM_TINY;
        }
        if (position.z - radius < this.minPos.z) {
            this.minPos.z = position.z - radius - JConfig.NUM_TINY;
        }
        if (position.z + radius > this.maxPos.z) {
            this.maxPos.z = position.z + radius + JConfig.NUM_TINY;
        }
    }

    overlapTest(box) {
        return !(this.minPos.z >= box.maxPos.z || this.maxPos.z <= box.minPos.z ||
            this.minPos.y >= box.maxPos.y || this.maxPos.y <= box.minPos.y ||
            this.minPos.x >= box.maxPos.x || this.maxPos.x <= box.minPos.x);
    }

    isPointInside(pos) {
        return pos.x >= this.minPos.x && pos.x <= this.maxPos.x &&
            pos.y >= this.minPos.y && pos.y <= this.maxPos.y &&
            pos.z >= this.minPos.z && pos.z <= this.maxPos.z;
    }
}
