import Vector3 from "./Vector3";

export default class Matrix44 {
    constructor(v) {
        this._rawData = new Float32Array(v || [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    }

    getData() {
        return this._rawData
    }

    copy(m) {
        const data = this._rawData;
        const v = m._rawData;
        data[0] = v[0];
        data[1] = v[1];
        data[2] = v[2];
        data[3] = v[3];
        data[4] = v[4];
        data[5] = v[5];
        data[6] = v[6];
        data[7] = v[7];
        data[8] = v[8];
        data[9] = v[9];
        data[10] = v[10];
        data[11] = v[11];
        data[12] = v[12];
        data[13] = v[13];
        data[14] = v[14];
        data[15] = v[15];
        return this;
    }

    clone() {
        return new Matrix44(this._rawData)
    }

    identity() {
        const data = this._rawData;
        data[0] = data[5] = data[10] = data[15] = 1;
        data[1] = data[2] = data[3] = data[4] = 0;
        data[6] = data[7] = data[8] = data[9] = 0;
        data[11] = data[12] = data[13] = data[14] = 0;
    }

    invert() {
        const data = this._rawData;
        const a00 = data[0], a01 = data[1], a02 = data[2], a03 = data[3];
        const a10 = data[4], a11 = data[5], a12 = data[6], a13 = data[7];
        const a20 = data[8], a21 = data[9], a22 = data[10], a23 = data[11];
        const a30 = data[12], a31 = data[13], a32 = data[14], a33 = data[15];

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

        data[0] = (a11 * b11 - a12 * b10 + a13 * b09) * invDet;
        data[1] = (-a01 * b11 + a02 * b10 - a03 * b09) * invDet;
        data[2] = (a31 * b05 - a32 * b04 + a33 * b03) * invDet;
        data[3] = (-a21 * b05 + a22 * b04 - a23 * b03) * invDet;
        data[4] = (-a10 * b11 + a12 * b08 - a13 * b07) * invDet;
        data[5] = (a00 * b11 - a02 * b08 + a03 * b07) * invDet;
        data[6] = (-a30 * b05 + a32 * b02 - a33 * b01) * invDet;
        data[7] = (a20 * b05 - a22 * b02 + a23 * b01) * invDet;
        data[8] = (a10 * b10 - a11 * b08 + a13 * b06) * invDet;
        data[9] = (-a00 * b10 + a01 * b08 - a03 * b06) * invDet;
        data[10] = (a30 * b04 - a31 * b02 + a33 * b00) * invDet;
        data[11] = (-a20 * b04 + a21 * b02 - a23 * b00) * invDet;
        data[12] = (-a10 * b09 + a11 * b07 - a12 * b06) * invDet;
        data[13] = (a00 * b09 - a01 * b07 + a02 * b06) * invDet;
        data[14] = (-a30 * b03 + a31 * b01 - a32 * b00) * invDet;
        data[15] = (a20 * b03 - a21 * b01 + a22 * b00) * invDet;
        return this;
    }

    multiply(a, b) {
        const adata = a._rawData;
        const a00 = adata[0], a01 = adata[1], a02 = adata[2], a03 = adata[3];
        const a10 = adata[4], a11 = adata[5], a12 = adata[6], a13 = adata[7];
        const a20 = adata[8], a21 = adata[9], a22 = adata[10], a23 = adata[11];
        const a30 = adata[12], a31 = adata[13], a32 = adata[14], a33 = adata[15];
        const bdata = b._rawData;
        const b00 = bdata[0], b01 = bdata[1], b02 = bdata[2], b03 = bdata[3];
        const b10 = bdata[4], b11 = bdata[5], b12 = bdata[6], b13 = bdata[7];
        const b20 = bdata[8], b21 = bdata[9], b22 = bdata[10], b23 = bdata[11];
        const b30 = bdata[12], b31 = bdata[13], b32 = bdata[14], b33 = bdata[15];
        const dest = this._rawData;
        dest[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
        dest[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
        dest[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
        dest[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
        dest[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
        dest[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
        dest[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
        dest[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
        dest[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
        dest[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
        dest[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
        dest[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
        dest[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
        dest[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
        dest[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
        dest[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;
        return this;
    }

    appendRotation(angle, axis) {
        angle = angle * Math.PI / 180;

        let x = -axis.x, y = -axis.y, z = -axis.z;
        const len = 1 / Math.sqrt(x * x + y * y + z * z);
        x *= len;
        y *= len;
        z *= len;

        const s = Math.sin(angle);
        const c = Math.cos(angle);
        const t = 1 - c;

        const data = this._rawData;
        const a00 = data[0], a01 = data[1], a02 = data[2], a03 = data[3];
        const a10 = data[4], a11 = data[5], a12 = data[6], a13 = data[7];
        const a20 = data[8], a21 = data[9], a22 = data[10], a23 = data[11];


        const b00 = x * x * t + c, b01 = y * x * t + z * s, b02 = z * x * t - y * s;
        const b10 = x * y * t - z * s, b11 = y * y * t + c, b12 = z * y * t + x * s;
        const b20 = x * z * t + y * s, b21 = y * z * t - x * s, b22 = z * z * t + c;


        data[0] = a00 * b00 + a10 * b01 + a20 * b02;
        data[1] = a01 * b00 + a11 * b01 + a21 * b02;
        data[2] = a02 * b00 + a12 * b01 + a22 * b02;
        data[3] = a03 * b00 + a13 * b01 + a23 * b02;
        data[4] = a00 * b10 + a10 * b11 + a20 * b12;
        data[5] = a01 * b10 + a11 * b11 + a21 * b12;
        data[6] = a02 * b10 + a12 * b11 + a22 * b12;
        data[7] = a03 * b10 + a13 * b11 + a23 * b12;
        data[8] = a00 * b20 + a10 * b21 + a20 * b22;
        data[9] = a01 * b20 + a11 * b21 + a21 * b22;
        data[10] = a02 * b20 + a12 * b21 + a22 * b22;
        data[11] = a03 * b20 + a13 * b21 + a23 * b22;

        return this;
    }

    append(m) {
        return this.multiply(this, m);
    }

    transformVector(vector) {
        const mat = this._rawData;
        return new Vector3(mat[0] * vector.x + mat[1] * vector.y + mat[2] * vector.z + mat[3],
            mat[4] * vector.x + mat[5] * vector.y + mat[6] * vector.z + mat[7],
            mat[8] * vector.x + mat[9] * vector.y + mat[10] * vector.z + mat[11]);
    }

    transformSelfVector(vector) {
        const x = vector.x;
        const y = vector.y;
        const z = vector.z;
        const mat = this._rawData;
        vector.x = mat[0] * x + mat[1] * y + mat[2] * z + mat[3];
        vector.y = mat[4] * x + mat[5] * y + mat[6] * z + mat[7];
        vector.z = mat[8] * x + mat[9] * y + mat[10] * z + mat[11];
    }

    transpose() {
        const mat = this._rawData;
        const a01 = mat[1], a02 = mat[2], a03 = mat[3], a12 = mat[6], a13 = mat[7], a23 = mat[11];
        mat[1] = mat[4];
        mat[2] = mat[8];
        mat[3] = mat[12];
        mat[4] = a01;
        mat[6] = mat[9];
        mat[7] = mat[13];
        mat[8] = a02;
        mat[9] = a12;
        mat[11] = mat[14];
        mat[12] = a03;
        mat[13] = a13;
        mat[14] = a23;
        return this;
    }
}

