export default class AABox {
    constructor() {
        this.extents = new Float32Array(6);
        this.reset();
    }

    reset() {
        this.extents[0] = this.extents[1] = this.extents[2] = Number.POSITIVE_INFINITY;
        this.extents[3] = this.extents[4] = this.extents[5] = Number.NEGATIVE_INFINITY;
    }

    numberOfPointsOutside(pl) {
        let l = 0;
        const xmin = this.extents[0];
        const ymin = this.extents[1];
        const zmin = this.extents[2];
        const xmax = this.extents[3];
        const ymax = this.extents[4];
        const zmax = this.extents[5];
        pl[0] * xmin + pl[1] * ymax + pl[2] * zmin > pl[3] && ++l;
        pl[0] * xmax + pl[1] * ymax + pl[2] * zmin > pl[3] && ++l;
        pl[0] * xmax + pl[1] * ymin + pl[2] * zmin > pl[3] && ++l;
        pl[0] * xmin + pl[1] * ymin + pl[2] * zmin > pl[3] && ++l;
        pl[0] * xmin + pl[1] * ymax + pl[2] * zmax > pl[3] && ++l;
        pl[0] * xmax + pl[1] * ymax + pl[2] * zmax > pl[3] && ++l;
        pl[0] * xmax + pl[1] * ymin + pl[2] * zmax > pl[3] && ++l;
        pl[0] * xmin + pl[1] * ymin + pl[2] * zmax > pl[3] && ++l;
        return l;
    }

    aggregate(x, y, z) {
        x < this.extents[0] && (this.extents[0] = x);
        y < this.extents[1] && (this.extents[1] = y);
        z < this.extents[2] && (this.extents[2] = z);
        x > this.extents[3] && (this.extents[3] = x);
        y > this.extents[4] && (this.extents[4] = y);
        z > this.extents[5] && (this.extents[5] = z);
    }

    aggregateInto(other) {
        other.aggregate(this.extents[0], this.extents[1], this.extents[2]);
        other.aggregate(this.extents[3], this.extents[4], this.extents[5]);
    }

    transformInto(target, matrix) {
        const e11 = matrix[0];
        const e12 = matrix[4];
        const e13 = matrix[8];
        const e14 = matrix[12];
        const e21 = matrix[1];
        const e22 = matrix[5];
        const e23 = matrix[9];
        const e24 = matrix[13];
        const e31 = matrix[2];
        const e32 = matrix[6];
        const e33 = matrix[10];
        const e34 = matrix[14];
        const e41 = matrix[3];
        const e42 = matrix[7];
        const e43 = matrix[11];
        const e44 = matrix[15];
        const xmin = this.extents[0];
        const ymin = this.extents[1];
        const zmin = this.extents[2];
        const xmax = this.extents[3];
        const ymax = this.extents[4];
        const zmax = this.extents[5];
        let ow = 1 / (e41 * xmin + e42 * ymax + e43 * zmin + e44);
        target.aggregate(ow * (e11 * xmin + e12 * ymax + e13 * zmin + e14), ow * (e21 * xmin + e22 * ymax + e23 * zmin + e24), ow * (e31 * xmin + e32 * ymax + e33 * zmin + e34));
        ow = 1 / (e41 * xmax + e42 * ymax + e43 * zmin + e44);
        target.aggregate(ow * (e11 * xmax + e12 * ymax + e13 * zmin + e14), ow * (e21 * xmax + e22 * ymax + e23 * zmin + e24), ow * (e31 * xmax + e32 * ymax + e33 * zmin + e34));
        ow = 1 / (e41 * xmax + e42 * ymin + e43 * zmin + e44);
        target.aggregate(ow * (e11 * xmax + e12 * ymin + e13 * zmin + e14), ow * (e21 * xmax + e22 * ymin + e23 * zmin + e24), ow * (e31 * xmax + e32 * ymin + e33 * zmin + e34));
        ow = 1 / (e41 * xmin + e42 * ymin + e43 * zmin + e44);
        target.aggregate(ow * (e11 * xmin + e12 * ymin + e13 * zmin + e14), ow * (e21 * xmin + e22 * ymin + e23 * zmin + e24), ow * (e31 * xmin + e32 * ymin + e33 * zmin + e34));
        ow = 1 / (e41 * xmin + e42 * ymax + e43 * zmax + e44);
        target.aggregate(ow * (e11 * xmin + e12 * ymax + e13 * zmax + e14), ow * (e21 * xmin + e22 * ymax + e23 * zmax + e24), ow * (e31 * xmin + e32 * ymax + e33 * zmax + e34));
        ow = 1 / (e41 * xmax + e42 * ymax + e43 * zmax + e44);
        target.aggregate(ow * (e11 * xmax + e12 * ymax + e13 * zmax + e14), ow * (e21 * xmax + e22 * ymax + e23 * zmax + e24), ow * (e31 * xmax + e32 * ymax + e33 * zmax + e34));
        ow = 1 / (e41 * xmax + e42 * ymin + e43 * zmax + e44);
        target.aggregate(ow * (e11 * xmax + e12 * ymin + e13 * zmax + e14), ow * (e21 * xmax + e22 * ymin + e23 * zmax + e24), ow * (e31 * xmax + e32 * ymin + e33 * zmax + e34));
        ow = 1 / (e41 * xmin + e42 * ymin + e43 * zmax + e44);
        target.aggregate(ow * (e11 * xmin + e12 * ymin + e13 * zmax + e14), ow * (e21 * xmin + e22 * ymin + e23 * zmax + e24), ow * (e31 * xmin + e32 * ymin + e33 * zmax + e34));
    }
}
