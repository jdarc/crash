import Vector3 from "../math/Vector3";

export default class TerrainData {
    constructor(height, normal) {
        this.height = isNaN(height) ? 0 : height;
        this.normal = normal ? normal : new Vector3();
    }
}

