import Vector3 from "../math/Vector3";

export default class CollOutData {
    constructor(frac, position, normal) {
        this.frac = isNaN(frac) ? 0 : frac;
        this.position = position ? position : new Vector3;
        this.normal = normal ? normal : new Vector3;
    }
}
