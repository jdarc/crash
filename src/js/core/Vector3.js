export default class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this._data = new Float32Array([x, y, z]);
    }

    get x() {
        return this._data[0];
    }

    set x(n) {
        this._data[0] = n;
    }

    get y() {
        return this._data[1];
    }

    set y(n) {
        this._data[1] = n;
    }

    get z() {
        return this._data[2];
    }

    set z(n) {
        this._data[2] = n;
    }

    get data() {
        return this._data;
    }

    get lengthSq() {
        return this._data[0] * this._data[0] + this._data[1] * this._data[1] + this._data[2] * this._data[2];
    }

    get length() {
        return Math.sqrt(this.lengthSq);
    }

    setTo(x, y, z) {
        this._data[0] = x;
        this._data[1] = y;
        this._data[2] = z;
        return this;
    }

    copy(v) {
        return this.setTo(v.data[0], v.data[1], v.data[2]);
    }

    clone() {
        return new Vector3(this._data[0], this._data[1], this._data[2]);
    }

    normalize() {
        const len = this.length;
        return this.mul(len > 0 ? 1 / len : 0);
    }

    sub(v) {
        this._data[0] -= v.data[0];
        this._data[1] -= v.data[1];
        this._data[2] -= v.data[2];
        return this;
    }

    add(v) {
        this._data[0] += v.data[0];
        this._data[1] += v.data[1];
        this._data[2] += v.data[2];
        return this;
    }

    mul(s) {
        this._data[0] *= s;
        this._data[1] *= s;
        this._data[2] *= s;
        return this;
    }

    negate() {
        return this.mul(-1);
    }

    dot(v) {
        return this._data[0] * v.data[0] + this._data[1] * v.data[1] + this._data[2] * v.data[2];
    }

    cross(a, b) {
        const da = a.data, ax = da[0], ay = da[1], az = da[2];
        const db = b.data, bx = db[0], by = db[1], bz = db[2];
        return this.setTo(ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx);
    }

    transform(v, m) {
        const x = m._data[0] * v._data[0] + m._data[4] * v._data[1] + m._data[8] * v._data[2] + m._data[12];
        const y = m._data[1] * v._data[0] + m._data[5] * v._data[1] + m._data[9] * v._data[2] + m._data[13];
        const z = m._data[2] * v._data[0] + m._data[6] * v._data[1] + m._data[10] * v._data[2] + m._data[14];
        return this.setTo(x, y, z);
    }

    toString() {
        return "[ " + this.x + ", " + this.y + ", " + this.z + " ]";
    }
}
