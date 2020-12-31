import Matrix44 from "../math/Matrix44";
import Vector3 from "../math/Vector3";

export default class PhysicsState {
    constructor() {
        this.position = new Vector3();
        this.orientation = new Matrix44();
        this.linVelocity = new Vector3();
        this.rotVelocity = new Vector3();
    }

    getOrientationCols() {
        const rawData = this.orientation.getData();
        const x = new Vector3(rawData[0], rawData[4], rawData[8]);
        const y = new Vector3(rawData[1], rawData[5], rawData[9]);
        const z = new Vector3(rawData[2], rawData[6], rawData[10]);
        return [x, y, z];
    }
}

