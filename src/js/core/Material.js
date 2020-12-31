let idd = 0;

export default class Material {
    constructor() {
        this.id = idd++;
        this.image = null;
        this.texture = null;
    }
}

Material.DEFAULT = new Material()
