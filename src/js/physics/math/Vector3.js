export default class Vector3 {
    constructor(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    getZ() {
        return this.z;
    }

    getData() {
        return [this.x, this.y, this.z];
    }

    getLengthSquared() {
        return this.x * this.x + this.y * this.y + this.z * this.z
    }

    getLength() {
        return Math.sqrt(this.getLengthSquared());
    }

    copy(v) {
        return this.setTo(v.x, v.y, v.z);
    }

    clone() {
        return new Vector3(this.x, this.y, this.z)
    }

    setTo(xa, ya, za) {
        this.x = xa;
        this.y = ya;
        this.z = za;
        return this
    }

    add(a) {
        return new Vector3(this.x + a.x, this.y + a.y, this.z + a.z)
    }

    subtract(a) {
        return new Vector3(this.x - a.x, this.y - a.y, this.z - a.z)
    }

    scaleBy(s) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this
    }

    scaleXyz(s) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this
    }

    negate() {
        return this.scaleBy(-1);
    }

    normalize() {
        return this.scaleBy(1 / this.getLength());
    }

    dot(a) {
        return this.x * a.x + this.y * a.y + this.z * a.z;
    }

    cross(a) {
        return new Vector3(this.y * a.z - this.z * a.y, this.z * a.x - this.x * a.z, this.x * a.y - this.y * a.x)
    }
}

Vector3.X_AXIS = new Vector3(1, 0, 0);
Vector3.Y_AXIS = new Vector3(0, 1, 0);
Vector3.Z_AXIS = new Vector3(0, 0, 1);

