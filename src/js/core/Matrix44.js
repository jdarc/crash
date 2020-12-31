export default class Matrix44 {
    constructor(m00 = 0, m04 = 0, m08 = 0, m12 = 0, m01 = 0, m05 = 0, m09 = 0, m13 = 0, m02 = 0, m06 = 0, m10 = 0, m14 = 0, m03 = 0, m07 = 0, m11 = 0, m15 = 0) {
        this._data = new Float32Array(16);
        this.setTo(m00, m04, m08, m12, m01, m05, m09, m13, m02, m06, m10, m14, m03, m07, m11, m15);
    }

    get data() {
        return this._data;
    }

    setTo(m00, m04, m08, m12, m01, m05, m09, m13, m02, m06, m10, m14, m03, m07, m11, m15) {
        this._data[0] = m00;
        this._data[1] = m01;
        this._data[2] = m02;
        this._data[3] = m03;
        this._data[4] = m04;
        this._data[5] = m05;
        this._data[6] = m06;
        this._data[7] = m07;
        this._data[8] = m08;
        this._data[9] = m09;
        this._data[10] = m10;
        this._data[11] = m11;
        this._data[12] = m12;
        this._data[13] = m13;
        this._data[14] = m14;
        this._data[15] = m15;
        return this;
    }

    copy(m) {
        const it = m._data;
        return this.setTo(it[0], it[4], it[8], it[12], it[1], it[5], it[9], it[13], it[2], it[6], it[10], it[14], it[3], it[7], it[11], it[15]);
    }

    identity() {
        return this.setTo(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    }

    transpose() {
        const a01 = this._data[1];
        const a02 = this._data[2];
        const a03 = this._data[3];
        const a12 = this._data[6];
        const a13 = this._data[7];
        const a23 = this._data[11];
        this._data[1] = this._data[4];
        this._data[2] = this._data[8];
        this._data[3] = this._data[12];
        this._data[4] = a01;
        this._data[6] = this._data[9];
        this._data[7] = this._data[13];
        this._data[8] = a02;
        this._data[9] = a12;
        this._data[11] = this._data[14];
        this._data[12] = a03;
        this._data[13] = a13;
        this._data[14] = a23;
        return this;
    }

    multiply(a, b) {
        const a0 = a._data[0];
        const a4 = a._data[4];
        const a8 = a._data[8];
        const a12 = a._data[12];
        const a1 = a._data[1];
        const a5 = a._data[5];
        const a9 = a._data[9];
        const a13 = a._data[13];
        const a2 = a._data[2];
        const a6 = a._data[6];
        const a10 = a._data[10];
        const a14 = a._data[14];
        const a3 = a._data[3];
        const a7 = a._data[7];
        const a11 = a._data[11];
        const a15 = a._data[15];
        const b0 = b._data[0];
        const b4 = b._data[4];
        const b8 = b._data[8];
        const b12 = b._data[12];
        const b1 = b._data[1];
        const b5 = b._data[5];
        const b9 = b._data[9];
        const b13 = b._data[13];
        const b2 = b._data[2];
        const b6 = b._data[6];
        const b10 = b._data[10];
        const b14 = b._data[14];
        const b3 = b._data[3];
        const b7 = b._data[7];
        const b11 = b._data[11];
        const b15 = b._data[15];
        this._data[0] = a0 * b0 + a4 * b1 + a8 * b2 + a12 * b3;
        this._data[4] = a0 * b4 + a4 * b5 + a8 * b6 + a12 * b7;
        this._data[8] = a0 * b8 + a4 * b9 + a8 * b10 + a12 * b11;
        this._data[12] = a0 * b12 + a4 * b13 + a8 * b14 + a12 * b15;
        this._data[1] = a1 * b0 + a5 * b1 + a9 * b2 + a13 * b3;
        this._data[5] = a1 * b4 + a5 * b5 + a9 * b6 + a13 * b7;
        this._data[9] = a1 * b8 + a5 * b9 + a9 * b10 + a13 * b11;
        this._data[13] = a1 * b12 + a5 * b13 + a9 * b14 + a13 * b15;
        this._data[2] = a2 * b0 + a6 * b1 + a10 * b2 + a14 * b3;
        this._data[6] = a2 * b4 + a6 * b5 + a10 * b6 + a14 * b7;
        this._data[10] = a2 * b8 + a6 * b9 + a10 * b10 + a14 * b11;
        this._data[14] = a2 * b12 + a6 * b13 + a10 * b14 + a14 * b15;
        this._data[3] = a3 * b0 + a7 * b1 + a11 * b2 + a15 * b3;
        this._data[7] = a3 * b4 + a7 * b5 + a11 * b6 + a15 * b7;
        this._data[11] = a3 * b8 + a7 * b9 + a11 * b10 + a15 * b11;
        this._data[15] = a3 * b12 + a7 * b13 + a11 * b14 + a15 * b15;
        return this;
    }

    invert() {
        const a00 = this._data[0], a01 = this._data[1], a02 = this._data[2], a03 = this._data[3];
        const a10 = this._data[4], a11 = this._data[5], a12 = this._data[6], a13 = this._data[7];
        const a20 = this._data[8], a21 = this._data[9], a22 = this._data[10], a23 = this._data[11];
        const a30 = this._data[12], a31 = this._data[13], a32 = this._data[14], a33 = this._data[15];
        const b00 = a00 * a11 - a01 * a10;
        const b01 = a00 * a12 - a02 * a10;
        const b02 = a00 * a13 - a03 * a10;
        const b03 = a01 * a12 - a02 * a11;
        const b04 = a01 * a13 - a03 * a11;
        const b05 = a02 * a13 - a03 * a12;
        const b06 = a20 * a31 - a21 * a30;
        const b07 = a20 * a32 - a22 * a30;
        const b08 = a20 * a33 - a23 * a30;
        const b09 = a21 * a32 - a22 * a31;
        const b10 = a21 * a33 - a23 * a31;
        const b11 = a22 * a33 - a23 * a32;
        const invDet = 1 / (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);
        this._data[0] = (a11 * b11 - a12 * b10 + a13 * b09) * invDet;
        this._data[1] = (-a01 * b11 + a02 * b10 - a03 * b09) * invDet;
        this._data[2] = (a31 * b05 - a32 * b04 + a33 * b03) * invDet;
        this._data[3] = (-a21 * b05 + a22 * b04 - a23 * b03) * invDet;
        this._data[4] = (-a10 * b11 + a12 * b08 - a13 * b07) * invDet;
        this._data[5] = (a00 * b11 - a02 * b08 + a03 * b07) * invDet;
        this._data[6] = (-a30 * b05 + a32 * b02 - a33 * b01) * invDet;
        this._data[7] = (a20 * b05 - a22 * b02 + a23 * b01) * invDet;
        this._data[8] = (a10 * b10 - a11 * b08 + a13 * b06) * invDet;
        this._data[9] = (-a00 * b10 + a01 * b08 - a03 * b06) * invDet;
        this._data[10] = (a30 * b04 - a31 * b02 + a33 * b00) * invDet;
        this._data[11] = (-a20 * b04 + a21 * b02 - a23 * b00) * invDet;
        this._data[12] = (-a10 * b09 + a11 * b07 - a12 * b06) * invDet;
        this._data[13] = (a00 * b09 - a01 * b07 + a02 * b06) * invDet;
        this._data[14] = (-a30 * b03 + a31 * b01 - a32 * b00) * invDet;
        this._data[15] = (a20 * b03 - a21 * b01 + a22 * b00) * invDet;
        return this;
    }

    static createScale(x, y, z) {
        return new Matrix44(x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1);
    }

    static createTranslation(x, y, z) {
        return new Matrix44(1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1);
    }

    static createRotationAboutX(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Matrix44(1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1);
    }

    static createRotationAboutY(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Matrix44(c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1);
    }

    static createRotationAboutZ(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Matrix44(c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    }
}
