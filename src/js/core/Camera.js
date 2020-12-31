export default class Camera {
    constructor() {
        this.eye = new Float32Array([0, 0, 1]);
        this.center = new Float32Array([0, 0, 0]);
    }

    moveTo(x, y, z) {
        this.eye[0] = x;
        this.eye[1] = y;
        this.eye[2] = z;
    }

    lookAt(x, y, z) {
        this.center[0] = x;
        this.center[1] = y;
        this.center[2] = z;
    }
}


