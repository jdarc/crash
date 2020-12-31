import Vector3 from "../math/Vector3";

export default class CollPointInfo {
    constructor() {
        this.initialPenetration = 0;
        this.r0 = null;
        this.r1 = null;
        this.minSeparationVel = 0;
        this.denominator = 0;
        this.accumulatedNormalImpulse = 0;
        this.accumulatedNormalImpulseAux = 0;
        this.accumulatedFrictionImpulse = new Vector3();
    }
}

