let uid = 0;

const Material = function() {
    const id = uid++;

    this.image = null;
    this.texture = null;

    return {
        get id() {
            return id;
        }
    }
};

Material.DEFAULT = new Material()

export default Material
