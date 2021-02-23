import ModelFactory from "./ModelFactory";
import NormalType from "./NormalType";
import Material from "./Material";
import ResourceLoader, { loadImage } from "./ResourceLoader";

const extractVertexIndex = token => {
    const idx = token.indexOf("/");
    return idx === -1 ? token : token.substring(0, idx);
};

const extractTextureIndex = token => {
    if (token.indexOf("//") !== -1 || token.indexOf("/") === -1) return null;
    const split = token.split('/');
    return split.length < 1 ? null : split[1];
};

const extractNormalIndex = token => {
    const idx1 = token.indexOf("/");
    const idx2 = token.lastIndexOf("/");
    if (idx2 !== -1 && idx1 !== idx2) return token.substring(idx2 + 1);
    return null;
};

const extractFace = faceData => (model, line, smooth, material) => {
    const match = line.match(faceData);
    const v = new Int32Array(16);
    const vn = new Int32Array(16);
    const vt = new Int32Array(16);
    let vi = 0;
    let textured = true;
    let hasNormals = true;

    for (let i = 1; i < match.length; i++) {
        const token = match[i];
        const vvs = extractVertexIndex(token);
        const vns = extractNormalIndex(token);
        const vts = extractTextureIndex(token);

        v[vi] = parseInt(vvs) - 1;
        if (vts != null) {
            vt[vi] = parseInt(vts) - 1;
        } else {
            textured = false;
        }
        if (vns != null) {
            vn[vi] = parseInt(vns) - 1;
        } else {
            hasNormals = false;
        }
        vi++;
    }

    let triangleModifier = model.createTriangle(v[0], v[1], v[2]);
    if (textured) {
        triangleModifier.texelCoordinates(vt[0], vt[1], vt[2]);
    }
    if (hasNormals) {
        triangleModifier.normals(vn[0], vn[1], vn[2]).useNormals(NormalType.Triangle);
    } else if (smooth) {
        triangleModifier.useNormals(NormalType.Vertex);
    }
    triangleModifier.changeMaterial(material);

    for (let i = 1; i < vi - 2; i++) {
        triangleModifier = model.createTriangle(v[0], v[i + 1], v[i + 2]);
        if (textured) {
            triangleModifier.texelCoordinates(vt[0], vt[i + 1], vt[i + 2]);
        }
        if (hasNormals) {
            triangleModifier.normals(vn[0], vn[i + 1], vn[i + 2]).useNormals(NormalType.Vertex);
        } else if (smooth) {
            triangleModifier.useNormals(NormalType.Triangle);
        }
        triangleModifier.changeMaterial(material);
    }
};

const loadMaterials = (matLibName, materials) => {
    const resourceLoader = new ResourceLoader();
    resourceLoader.add("material_directives", matLibName);
    resourceLoader.load(function(resources) {
        const directives = resources["material_directives"];
        let key = "";
        const lines = directives.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.length > 0 && line[0] !== '#') {
                const fragments = line.split(" ");
                const fragmentKey = fragments[0].toLowerCase();
                if (fragmentKey === "newmtl") {
                    key = fragments[1];
                } else if (fragmentKey === 'map_kd') {
                    loadImage(resourceLoader.rootPath + "/" + fragments[1] + "?buster=1", (image, options) => {
                        if (materials[options.key]) materials[options.key].image = image;
                    }, { key, name: fragments[1] });
                }
            }
        }
    });
};

export default (directives) => {
    const materials = [];
    const model = new ModelFactory();
    let material = new Material();
    let materialLibraryName = "";
    let smooth = false;
    const lines = directives.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const type = line.substring(0, line.indexOf(' ')).toLowerCase();
        switch (type) {
            case 'mtllib':
                materialLibraryName = line.split(' ')[1].trim();
                loadMaterials(materialLibraryName, materials);
                break;
            case "v":
                const match0 = line.match(/v (.*) (.*) (.*)/);
                model.addVertex(parseFloat(match0[1]), parseFloat(match0[2]), parseFloat(match0[3]));
                break;
            case "vn":
                const match1 = line.match(/vn (.*) (.*) (.*)/);
                model.addNormal(parseFloat(match1[1]), parseFloat(match1[2]), parseFloat(match1[3]));
                break;
            case "vt":
                const match2 = line.match(/vt (.*) (.*)/);
                model.addUvCoordinate(parseFloat(match2[1]), parseFloat(match2[2]));
                break;
            case "f":
                extractFace(/f (.*) (.*) (.*)/)(model, line, smooth, material);
                break;
            case "s":
                smooth = line.match(/s (.*)/)[1] === "on";
                break;
            case "g":
                model.setCurrentGroup(line.match(/g (.*)/)[1]);
                break;
            case "usemtl":
                const materialName = line.match(/usemtl (.*)/)[1];
                if (!materials[materialName]) materials[materialName] = new Material();
                material = materials[materialName];
                break;
        }
    }
    return model;
}
