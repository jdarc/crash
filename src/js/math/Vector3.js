export default class Vector3 {

    constructor(x = 0, y = 0, z = 0) {
        if (x && typeof (x) === "object") {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
        } else {
            this.x = x;
            this.y = y;
            this.z = z;
        }
    }

    get length() {
        return Math.sqrt(this.lengthSquared);
    }

    get lengthSquared() {
        return this.x * this.x + this.y * this.y + this.z * this.z
    }

    setTo(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    copy(v) {
        return this.setTo(v.x, v.y, v.z);
    }

    normalize() {
        return this.scale(1 / this.length);
    }

    scale(s) {
        return this.setTo(s * this.x, s * this.y, s * this.z);
    }

    reverse() {
        return this.setTo(-this.x, -this.y, -this.z);
    }

    add(v) {
        return this.setTo(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    sub(v) {
        return this.setTo(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    plus(v) {
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z)
    }

    minus(v) {
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z)
    }

    transform(m) {
        const x = m.data[0x0] * this.x + m.data[0x1] * this.y + m.data[0x2] * this.z + m.data[0x3];
        const y = m.data[0x4] * this.x + m.data[0x5] * this.y + m.data[0x6] * this.z + m.data[0x7];
        const z = m.data[0x8] * this.x + m.data[0x9] * this.y + m.data[0xa] * this.z + m.data[0xb];
        return this.setTo(x, y, z);
    }

    static dot(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    static cross(a, b) {
        return new Vector3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x)
    }
}
