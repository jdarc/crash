import CollisionSystem from "./CollisionSystem";
import CollDetectInfo from "../data/CollDetectInfo";

export default class CollisionSystemBrute extends CollisionSystem {
    constructor() {
        super();
    }

    detectAllCollisions(bodies, collisionFunctor, collToll) {
        const detectionFunctors = this.detectionFunctors;
        for (let i = 0; i < bodies.length; ++i) {
            const body = bodies[i];
            if (!body.isActive()) continue;
            for (let j = 0; j < this.collBody.length; ++j) {
                const collBody = this.collBody[j];
                if (body === collBody || (collBody.isActive() && body.getId() > collBody.getId())) continue;
                const fu = detectionFunctors[body.getType() + "_" + collBody.getType()];
                if (fu && this.checkCollidables(body, collBody)) {
                    const info = new CollDetectInfo();
                    info.body0 = body;
                    info.body1 = collBody;
                    fu.collDetect(info, collToll, collisionFunctor);
                }
            }
        }
    }
}
