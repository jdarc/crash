import Vector3 from "../math/Vector3";
import JMath3D from "../JMath3D";
import EdgeData from "../data/EdgeData";

export default class JAABox {
    constructor() {
        this.minPos = new Vector3;
        this.maxPos = new Vector3;
        this.clear();
    }

    getSideLengths() {
        let pos = this.maxPos.clone();
        pos = pos.subtract(this.minPos);
        return pos;
    }

    get_centrePos() {
        const pos = this.minPos.clone();
        return new Vector3(pos.add(this.maxPos).x * 0.5, pos.add(this.maxPos).y * 0.5, pos.add(this.maxPos).z * 0.5);
    }

    getAllPoints() {
        const center = this.get_centrePos();
        const sideLengths = this.getSideLengths();
        const x = sideLengths.x * 0.5;
        const y = sideLengths.y * 0.5;
        const z = sideLengths.z * 0.5;
        return [center.add(new Vector3(x, -y, z)),
            center.add(new Vector3(x, y, z)),
            center.add(new Vector3(-x, -y, z)),
            center.add(new Vector3(-x, y, z)),
            center.add(new Vector3(-x, -y, -z)),
            center.add(new Vector3(-x, y, -z)),
            center.add(new Vector3(x, -y, -z)),
            center.add(new Vector3(x, y, -z))];
    }

    getEdges() {
        return [new EdgeData(0, 1), new EdgeData(0, 2), new EdgeData(0, 6),
            new EdgeData(2, 3), new EdgeData(2, 4), new EdgeData(6, 7),
            new EdgeData(6, 4), new EdgeData(1, 3), new EdgeData(1, 7),
            new EdgeData(3, 5), new EdgeData(7, 5), new EdgeData(4, 5)];
    }

    getRadiusAboutCentre() {
        return 0.5 * (this.maxPos.subtract(this.minPos).getLength());
    }

    move(delta) {
        this.minPos.add(delta);
        this.maxPos.add(delta);
    }

    clear() {
        this.minPos = new Vector3(JMath3D.NUM_HUGE, JMath3D.NUM_HUGE, JMath3D.NUM_HUGE);
        this.maxPos = new Vector3(-JMath3D.NUM_HUGE, -JMath3D.NUM_HUGE, -JMath3D.NUM_HUGE);
    }

    clone() {
        const aabb = new JAABox();
        aabb.minPos = this.minPos.clone();
        aabb.maxPos = this.maxPos.clone();
        return aabb;
    }

    addPoint(pos) {
        if (pos.x < this.minPos.x) {
            this.minPos.x = pos.x - JMath3D.NUM_TINY;
        }
        if (pos.x > this.maxPos.x) {
            this.maxPos.x = pos.x + JMath3D.NUM_TINY;
        }
        if (pos.y < this.minPos.y) {
            this.minPos.y = pos.y - JMath3D.NUM_TINY;
        }
        if (pos.y > this.maxPos.y) {
            this.maxPos.y = pos.y + JMath3D.NUM_TINY;
        }
        if (pos.z < this.minPos.z) {
            this.minPos.z = pos.z - JMath3D.NUM_TINY;
        }
        if (pos.z > this.maxPos.z) {
            this.maxPos.z = pos.z + JMath3D.NUM_TINY;
        }
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
        const radius = sphere.get_radius();
        if (position.x - radius < this.minPos.x) {
            this.minPos.x = position.x - radius - JMath3D.NUM_TINY;
        }
        if (position.x + radius > this.maxPos.x) {
            this.maxPos.x = position.x + radius + JMath3D.NUM_TINY;
        }

        if (position.y - radius < this.minPos.y) {
            this.minPos.y = position.y - radius - JMath3D.NUM_TINY;
        }
        if (position.y + radius > this.maxPos.y) {
            this.maxPos.y = position.y + radius + JMath3D.NUM_TINY;
        }

        if (position.z - radius < this.minPos.z) {
            this.minPos.z = position.z - radius - JMath3D.NUM_TINY;
        }
        if (position.z + radius > this.maxPos.z) {
            this.maxPos.z = position.z + radius + JMath3D.NUM_TINY;
        }
    }

    addCapsule(capsule) {
        let pos = capsule.getBottomPos(capsule.getCurrState());
        const radius = capsule.get_radius();
        if (pos.x - radius < this.minPos.x) {
            this.minPos.x = pos.x - radius - JMath3D.NUM_TINY;
        }
        if (pos.x + radius > this.maxPos.x) {
            this.maxPos.x = pos.x + radius + JMath3D.NUM_TINY;
        }

        if (pos.y - radius < this.minPos.y) {
            this.minPos.y = pos.y - radius - JMath3D.NUM_TINY;
        }
        if (pos.y + radius > this.maxPos.y) {
            this.maxPos.y = pos.y + radius + JMath3D.NUM_TINY;
        }

        if (pos.z - radius < this.minPos.z) {
            this.minPos.z = pos.z - radius - JMath3D.NUM_TINY;
        }
        if (pos.z + radius > this.maxPos.z) {
            this.maxPos.z = pos.z + radius + JMath3D.NUM_TINY;
        }

        pos = capsule.getEndPos(capsule.getCurrState());
        if (pos.x - radius < this.minPos.x) {
            this.minPos.x = pos.x - radius - 1;
        }
        if (pos.x + radius > this.maxPos.x) {
            this.maxPos.x = pos.x + radius + 1;
        }

        if (pos.y - radius < this.minPos.y) {
            this.minPos.y = pos.y - radius - 1;
        }
        if (pos.y + radius > this.maxPos.y) {
            this.maxPos.y = pos.y + radius + 1;
        }

        if (pos.z - radius < this.minPos.z) {
            this.minPos.z = pos.z - radius - 1;
        }
        if (pos.z + radius > this.maxPos.z) {
            this.maxPos.z = pos.z + radius + 1;
        }
    }

    addSegment(seg) {
        this.addPoint(seg.origin);
        this.addPoint(seg.getEnd());
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

    segmentAABoxOverlap(seg) {
        let jDir, kDir, faceOffsets, dist0, dist1, frac, pt, i, iFace;
        const minPosArr = [this.minPos.x, this.minPos.y, this.minPos.z];
        const maxPosArr = [this.maxPos.x, this.maxPos.y, this.maxPos.z];
        const end = seg.getEnd();
        const p0 = [seg.origin.x, seg.origin.y, seg.origin.z];
        const p1 = [end.x, end.y, end.z];
        for (i = 0; i < 3; i++) {
            jDir = (i + 1) % 3;
            kDir = (i + 2) % 3;
            faceOffsets = [minPosArr[i], maxPosArr[i]];
            for (iFace = 0; iFace < 2; iFace++) {
                dist0 = p0[i] - faceOffsets[iFace];
                dist1 = p1[i] - faceOffsets[iFace];
                frac = -1;
                if (dist0 * dist1 < -JMath3D.NUM_TINY) {
                    frac = -dist0 / (dist1 - dist0);
                } else if (Math.abs(dist0) < JMath3D.NUM_TINY) {
                    frac = 0;
                } else if (Math.abs(dist1) < JMath3D.NUM_TINY) {
                    frac = 1;
                }
                if (frac >= 0) {
                    const point = seg.getPoint(frac);
                    pt = [point.x, point.y, point.z];
                    if (pt[jDir] > minPosArr[jDir] - JMath3D.NUM_TINY && pt[jDir] < maxPosArr[jDir] + JMath3D.NUM_TINY &&
                        pt[kDir] > minPosArr[kDir] - JMath3D.NUM_TINY && pt[kDir] < maxPosArr[kDir] + JMath3D.NUM_TINY) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    static overlapTest() {
        return true;
    }
}


