import Vector3 from "./Vector3";

export default class Ray {
    constructor(origin, direction) {
        this.origin = origin;
        this.direction = direction;
    }

    getPoint(t) {
        const x = this.origin.x + t * this.direction.x;
        const y = this.origin.y + t * this.direction.y;
        const z = this.origin.z + t * this.direction.z;
        return new Vector3(x, y, z);
    }

    clone() {
        return new Ray(new Vector3(this.origin), new Vector3(this.direction));
    }
}
