export default class MaterialProperties {
    constructor(restitution, staticFriction, dynamicFriction) {
        this.restitution = restitution || 0.25;
        this.staticFriction = staticFriction || 0.25;
        this.dynamicFriction = dynamicFriction || 0.25;
    }
}
