import Vector3 from "./Vector3";

export default class Matrix4 {

    constructor(v) {
        this.data = new Float32Array(v ? [ ...(v.data || v) ] : [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ]);
    }

    copy(m) {
        for (let i = 0; i < 16; ++i) this.data[i] = m.data[i];
        return this;
    }

    transpose() {
        const m1 = this.data[0x1];
        const m2 = this.data[0x2];
        const m3 = this.data[0x3];
        const m6 = this.data[0x6];
        const m7 = this.data[0x7];
        const mb = this.data[0xb];
        this.data[0x1] = this.data[0x4];
        this.data[0x2] = this.data[0x8];
        this.data[0x3] = this.data[0xc];
        this.data[0x4] = m1;
        this.data[0x6] = this.data[0x9];
        this.data[0x7] = this.data[0xd];
        this.data[0x8] = m2;
        this.data[0x9] = m6;
        this.data[0xb] = this.data[0xe];
        this.data[0xc] = m3;
        this.data[0xd] = m7;
        this.data[0xe] = mb;
        return this;
    }

    invert() {
        const m0 = this.data[0x0];
        const m1 = this.data[0x1];
        const m2 = this.data[0x2];
        const m3 = this.data[0x3];
        const m4 = this.data[0x4];
        const m5 = this.data[0x5];
        const m6 = this.data[0x6];
        const m7 = this.data[0x7];
        const m8 = this.data[0x8];
        const m9 = this.data[0x9];
        const ma = this.data[0xa];
        const mb = this.data[0xb];
        const mc = this.data[0xc];
        const md = this.data[0xd];
        const me = this.data[0xe];
        const mf = this.data[0xf];
        const b00 = m0 * m5 - m1 * m4;
        const b01 = m0 * m6 - m2 * m4;
        const b02 = m0 * m7 - m3 * m4;
        const b03 = m1 * m6 - m2 * m5;
        const b04 = m1 * m7 - m3 * m5;
        const b05 = m2 * m7 - m3 * m6;
        const b06 = m8 * md - m9 * mc;
        const b07 = m8 * me - ma * mc;
        const b08 = m8 * mf - mb * mc;
        const b09 = m9 * me - ma * md;
        const b10 = m9 * mf - mb * md;
        const b11 = ma * mf - mb * me;
        const invDet = 1 / (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);
        this.data[0x0] = (m5 * b11 - m6 * b10 + m7 * b09) * invDet;
        this.data[0x1] = (m2 * b10 - m1 * b11 - m3 * b09) * invDet;
        this.data[0x2] = (md * b05 - me * b04 + mf * b03) * invDet;
        this.data[0x3] = (ma * b04 - m9 * b05 - mb * b03) * invDet;
        this.data[0x4] = (m6 * b08 - m4 * b11 - m7 * b07) * invDet;
        this.data[0x5] = (m0 * b11 - m2 * b08 + m3 * b07) * invDet;
        this.data[0x6] = (me * b02 - mc * b05 - mf * b01) * invDet;
        this.data[0x7] = (m8 * b05 - ma * b02 + mb * b01) * invDet;
        this.data[0x8] = (m4 * b10 - m5 * b08 + m7 * b06) * invDet;
        this.data[0x9] = (m1 * b08 - m0 * b10 - m3 * b06) * invDet;
        this.data[0xa] = (mc * b04 - md * b02 + mf * b00) * invDet;
        this.data[0xb] = (m9 * b02 - m8 * b04 - mb * b00) * invDet;
        this.data[0xc] = (m5 * b07 - m4 * b09 - m6 * b06) * invDet;
        this.data[0xd] = (m0 * b09 - m1 * b07 + m2 * b06) * invDet;
        this.data[0xe] = (md * b01 - mc * b03 - me * b00) * invDet;
        this.data[0xf] = (m8 * b03 - m9 * b01 + ma * b00) * invDet;
        return this;
    }

    concatenate(m) {
        return this.multiply(m, this);
    }

    multiply(a, b) {
        const a0 = a.data[0x0];
        const a1 = a.data[0x1];
        const a2 = a.data[0x2];
        const a3 = a.data[0x3];
        const a4 = a.data[0x4];
        const a5 = a.data[0x5];
        const a6 = a.data[0x6];
        const a7 = a.data[0x7];
        const a8 = a.data[0x8];
        const a9 = a.data[0x9];
        const aa = a.data[0xa];
        const ab = a.data[0xb];
        const ac = a.data[0xc];
        const ad = a.data[0xd];
        const ae = a.data[0xe];
        const af = a.data[0xf];
        const b0 = b.data[0x0];
        const b1 = b.data[0x1];
        const b2 = b.data[0x2];
        const b3 = b.data[0x3];
        const b4 = b.data[0x4];
        const b5 = b.data[0x5];
        const b6 = b.data[0x6];
        const b7 = b.data[0x7];
        const b8 = b.data[0x8];
        const b9 = b.data[0x9];
        const ba = b.data[0xa];
        const bb = b.data[0xb];
        const bc = b.data[0xc];
        const bd = b.data[0xd];
        const be = b.data[0xe];
        const bf = b.data[0xf];
        this.data[0x0] = a0 * b0 + a4 * b1 + a8 * b2 + ac * b3;
        this.data[0x1] = a1 * b0 + a5 * b1 + a9 * b2 + ad * b3;
        this.data[0x2] = a2 * b0 + a6 * b1 + aa * b2 + ae * b3;
        this.data[0x3] = a3 * b0 + a7 * b1 + ab * b2 + af * b3;
        this.data[0x4] = a0 * b4 + a4 * b5 + a8 * b6 + ac * b7;
        this.data[0x5] = a1 * b4 + a5 * b5 + a9 * b6 + ad * b7;
        this.data[0x6] = a2 * b4 + a6 * b5 + aa * b6 + ae * b7;
        this.data[0x7] = a3 * b4 + a7 * b5 + ab * b6 + af * b7;
        this.data[0x8] = a0 * b8 + a4 * b9 + a8 * ba + ac * bb;
        this.data[0x9] = a1 * b8 + a5 * b9 + a9 * ba + ad * bb;
        this.data[0xa] = a2 * b8 + a6 * b9 + aa * ba + ae * bb;
        this.data[0xb] = a3 * b8 + a7 * b9 + ab * ba + af * bb;
        this.data[0xc] = a0 * bc + a4 * bd + a8 * be + ac * bf;
        this.data[0xd] = a1 * bc + a5 * bd + a9 * be + ad * bf;
        this.data[0xe] = a2 * bc + a6 * bd + aa * be + ae * bf;
        this.data[0xf] = a3 * bc + a7 * bd + ab * be + af * bf;
        return this;
    }

    rotate(angle, axis) {
        let x = -axis.x;
        let y = -axis.y;
        let z = -axis.z;
        const len = 1 / Math.sqrt(x * x + y * y + z * z);
        x *= len;
        y *= len;
        z *= len;
        const s = Math.sin(angle * Math.PI / 180);
        const c = Math.cos(angle * Math.PI / 180);
        const t = 1 - c;
        const b00 = x * x * t + c;
        const b01 = y * x * t + z * s;
        const b02 = z * x * t - y * s;
        const b10 = x * y * t - z * s;
        const b11 = y * y * t + c;
        const b12 = z * y * t + x * s;
        const b20 = x * z * t + y * s;
        const b21 = y * z * t - x * s;
        const b22 = z * z * t + c;
        const a00 = this.data[0x0], a01 = this.data[0x1], a02 = this.data[0x2], a03 = this.data[0x3];
        const a10 = this.data[0x4], a11 = this.data[0x5], a12 = this.data[0x6], a13 = this.data[0x7];
        const a20 = this.data[0x8], a21 = this.data[0x9], a22 = this.data[0xa], a23 = this.data[0xb];
        this.data[0x0] = a00 * b00 + a10 * b01 + a20 * b02;
        this.data[0x1] = a01 * b00 + a11 * b01 + a21 * b02;
        this.data[0x2] = a02 * b00 + a12 * b01 + a22 * b02;
        this.data[0x3] = a03 * b00 + a13 * b01 + a23 * b02;
        this.data[0x4] = a00 * b10 + a10 * b11 + a20 * b12;
        this.data[0x5] = a01 * b10 + a11 * b11 + a21 * b12;
        this.data[0x6] = a02 * b10 + a12 * b11 + a22 * b12;
        this.data[0x7] = a03 * b10 + a13 * b11 + a23 * b12;
        this.data[0x8] = a00 * b20 + a10 * b21 + a20 * b22;
        this.data[0x9] = a01 * b20 + a11 * b21 + a21 * b22;
        this.data[0xa] = a02 * b20 + a12 * b21 + a22 * b22;
        this.data[0xb] = a03 * b20 + a13 * b21 + a23 * b22;
        return this;
    }

    static createScale(x, y, z) {
        return new Matrix4([ x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1 ]);
    }

    static createTranslation(x, y, z) {
        return new Matrix4([ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1 ]);
    }

    static createRotationAboutX(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Matrix4([ 1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1 ]);
    }

    static createRotationAboutY(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Matrix4([ c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1 ]);
    }

    static generateViewMatrix(position, target, up, dst) {
        let z = new Vector3(position).sub(target).normalize();
        let x = Vector3.cross(up, z).normalize();
        let y = Vector3.cross(z, x).normalize();
        dst[0x0] = x.x;
        dst[0x1] = y.x;
        dst[0x2] = z.x;
        dst[0x3] = 0;
        dst[0x4] = x.y;
        dst[0x5] = y.y;
        dst[0x6] = z.y;
        dst[0x7] = 0;
        dst[0x8] = x.z;
        dst[0x9] = y.z;
        dst[0xa] = z.z;
        dst[0xb] = 0;
        dst[0xc] = -Vector3.dot(x, position);
        dst[0xd] = -Vector3.dot(y, position);
        dst[0xe] = -Vector3.dot(z, position);
        dst[0xf] = 1;
    }

    static generatePerspectiveFov(fov, aspectRatio, near, far, dst) {
        dst.fill(0);
        dst[0x5] = 1 / Math.tan(fov * Math.PI / 360);
        dst[0x0] = dst[5] / aspectRatio;
        dst[0xa] = -(far + near) / (far - near);
        dst[0xb] = -1;
        dst[0xe] = -(2 * far * near) / (far - near);
    }
}

