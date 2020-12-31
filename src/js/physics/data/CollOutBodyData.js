import CollOutData from "./CollOutData";

export default class CollOutBodyData extends CollOutData {
    constructor(frac, position, normal, rigidBody) {
        super(frac, position, normal);
        this.rigidBody = rigidBody;
    }
}
