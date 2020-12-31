import Vector3 from "../math/Vector3";

export default class JRay {
    constructor(_origin, _dir) {
        this.origin = _origin;
        this.dir = _dir;
    }

    getOrigin(t) {
        return this.origin.add(new Vector3(this.dir.x * t, this.dir.y * t, this.dir.z * t));
    }
}

