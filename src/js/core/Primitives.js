import ModelFactory from "./ModelFactory";
import Vector3 from "./Vector3";

const Primitives = {};

Primitives.buildPlane = material => {
    const model = new ModelFactory();

    model.addVertex(-1, 0, 1);
    model.addVertex(1, 0, 1);
    model.addVertex(1, 0, -1);
    model.addVertex(-1, 0, -1);

    model.addNormal(0, 1, 0);

    model.addUvCoordinate(0, 0);
    model.addUvCoordinate(1, 0);
    model.addUvCoordinate(1, 1);
    model.addUvCoordinate(0, 1);

    model.createTriangle(0, 1, 2).normals(0, 0, 0).texelCoordinates(0, 1, 2);
    model.createTriangle(2, 3, 0).normals(0, 0, 0).texelCoordinates(2, 3, 0);

    model.changeMaterial(material);
    return model.compile(false);
};

Primitives.buildUnitCube = material => Primitives.buildCube(material, new Vector3(-1, -1, -1), new Vector3(1, 1, 1));

Primitives.buildCube = (material, min, max) => {
    const model = new ModelFactory();

    model.addVertex(min.x, max.y, min.z);
    model.addVertex(max.x, max.y, min.z);
    model.addVertex(max.x, min.y, min.z);
    model.addVertex(min.x, min.y, min.z);
    model.addVertex(max.x, max.y, max.z);
    model.addVertex(min.x, max.y, max.z);
    model.addVertex(min.x, min.y, max.z);
    model.addVertex(max.x, min.y, max.z);

    model.addNormal(0, 0, -1);
    model.addNormal(1, 0, 0);
    model.addNormal(0, 0, 1);
    model.addNormal(-1, 0, 0);
    model.addNormal(0, 1, 0);
    model.addNormal(0, -1, 0);

    model.addUvCoordinate(0.0, 0.0);
    model.addUvCoordinate(1.0, 0.0);
    model.addUvCoordinate(1.0, 1.0);
    model.addUvCoordinate(0.0, 1.0);

    model.createTriangle(0, 1, 2).texelCoordinates(0, 1, 2).normals(0, 0, 0);
    model.createTriangle(2, 3, 0).texelCoordinates(2, 3, 0).normals(0, 0, 0);
    model.createTriangle(1, 4, 7).texelCoordinates(0, 1, 2).normals(1, 1, 1);
    model.createTriangle(7, 2, 1).texelCoordinates(2, 3, 0).normals(1, 1, 1);
    model.createTriangle(4, 5, 6).texelCoordinates(0, 1, 2).normals(2, 2, 2);
    model.createTriangle(6, 7, 4).texelCoordinates(2, 3, 0).normals(2, 2, 2);
    model.createTriangle(0, 3, 6).texelCoordinates(0, 1, 2).normals(3, 3, 3);
    model.createTriangle(6, 5, 0).texelCoordinates(2, 3, 0).normals(3, 3, 3);
    model.createTriangle(0, 5, 4).texelCoordinates(0, 1, 2).normals(4, 4, 4);
    model.createTriangle(4, 1, 0).texelCoordinates(2, 3, 0).normals(4, 4, 4);
    model.createTriangle(3, 2, 7).texelCoordinates(0, 1, 2).normals(5, 5, 5);
    model.createTriangle(7, 6, 3).texelCoordinates(2, 3, 0).normals(5, 5, 5);

    model.changeMaterial(material);
    return model.compile(true);
};

Primitives.buildUnitSphere = material => Primitives.buildSphere(1, 16, 16, material);

Primitives.buildSphere = function(radius, stacks, slices, material) {
    const model = new ModelFactory();
    const stackAngle = Math.PI / stacks;
    const sliceAngle = 2 * Math.PI / slices;
    let offset = 0;
    for (let stack = 0; stack < (stacks + 1); stack++) {
        const r = Math.sin(stack * stackAngle);
        const y = Math.cos(stack * stackAngle);
        for (let slice = 0; slice < (slices + 1); slice++) {
            const x = r * Math.sin(slice * sliceAngle);
            const z = r * Math.cos(slice * sliceAngle);
            model.addVertex(x * radius, y * radius, z * radius);
            model.addNormal(x, y, z);
            model.addUvCoordinate(1 - slice / slices, stack / stacks);
            if (stack !== stacks - 1) {
                const ma = offset + (slices + 1);
                const mb = offset + 1;
                const mc = offset;
                const md = offset + (slices);
                const me = offset + (slices + 1);
                const mf = offset++;
                model.createTriangle(ma, mb, mc).texelCoordinates(ma, mb, mc).normals(ma, mb, mc);
                model.createTriangle(md, me, mf).texelCoordinates(md, me, mf).normals(md, me, mf);
            }
        }
    }
    model.changeMaterial(material);
    return model.compile(true);
};

export default Primitives
