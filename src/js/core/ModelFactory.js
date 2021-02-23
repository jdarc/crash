import Model from "./Model";
import Material from "./Material";
import Mesh from "./Mesh";
import Buffer from "./Buffer";
import NormalType from "./NormalType";
import Vector3 from "../math/Vector3";

class Vertex {
    constructor(vx = 0, vy = 0, vz = 0, nx = 0, ny = 0, nz = 0, tu = 0, tv = 0) {
        this.vx = vx;
        this.vy = vy;
        this.vz = vz;
        this.nx = nx;
        this.ny = ny;
        this.nz = nz;
        this.tu = tu;
        this.tv = tv;
    }
}

const encodeVertexToString = vertex => {
    return [vertex.vx, vertex.vy, vertex.vz, vertex.nx, vertex.ny, vertex.nz, vertex.tu, vertex.tv].join(',');
}

const decodeVertexFromString = s => {
    const split = s.split(',');
    const vx = parseFloat(split[0]);
    const vy = parseFloat(split[1]);
    const vz = parseFloat(split[2]);
    const nx = parseFloat(split[3]);
    const ny = parseFloat(split[4]);
    const nz = parseFloat(split[5]);
    const tu = parseFloat(split[6]);
    const tv = parseFloat(split[7]);
    return new Vertex(vx, vy, vz, nx, ny, nz, tu, tv);
}

const optimizer = function(vertexBuffer, indexBuffer) {
    const vertexMap = {};
    const optVertices = [];
    const optTriangles = new Uint16Array(indexBuffer.length);
    let vertexMapCount = 0;
    for (let i = 0; i < indexBuffer.length; ++i) {
        const encoded = encodeVertexToString(vertexBuffer[indexBuffer[i]]);
        vertexMap.hasOwnProperty(encoded) || (vertexMap[encoded] = vertexMapCount++);
        optTriangles[i] = vertexMap[encoded];
    }
    for (const key in vertexMap) {
        if (vertexMap.hasOwnProperty(key)) {
            optVertices.push(decodeVertexFromString(key));
        }
    }
    return {optVertices, optTriangles};
};

const convertVertices = function(vertices) {
    const buffer = new Float32Array(vertices.length << 3);
    for (let i = 0, j = 0; i < vertices.length; ++i) {
        const v = vertices[i];
        buffer[j++] = v.vx;
        buffer[j++] = v.vy;
        buffer[j++] = v.vz;
        buffer[j++] = v.nx;
        buffer[j++] = v.ny;
        buffer[j++] = v.nz;
        buffer[j++] = v.tu;
        buffer[j++] = v.tv;
    }
    return buffer;
};

export default function() {

    class Triangle {
        constructor(a, b, c) {
            this.a = {vertex: a, normal: 0, texel: 0};
            this.b = {vertex: b, normal: 0, texel: 0};
            this.c = {vertex: c, normal: 0, texel: 0};
            this.normalType = NormalType.Surface;
            this.material = Material.DEFAULT;
            this.surfaceNormal = new Vector3(0, 0, 0)
        }

        normals(a, b, c) {
            this.a.normal = a;
            this.b.normal = b;
            this.c.normal = c;
            this.normalType = NormalType.Triangle;
            return this
        }

        texelCoordinates(a, b, c) {
            this.a.texel = a;
            this.b.texel = b;
            this.c.texel = c;
            return this
        }

        useNormals(a) {
            this.normalType = a;
            return this
        }

        changeMaterial(a) {
            this.material = a;
            return this
        }
    }

    const _vertices = [];
    const _vertexNormals = [];
    const _triangleNormals = [];
    const _uvCoordinates = [];
    const _triangles = [];
    const _groups = {};
    const _materials = {};
    let _currentGroup = [];
    let _currentGroupName = "";

    const purge = function() {
        _vertices.length = 0;
        _vertexNormals.length = 0;
        _triangleNormals.length = 0;
        _uvCoordinates.length = 0;
        _triangles.length = 0;
        _groups.clear();
        _currentGroup.clear();
    };

    const getTriangleModifierFor = index => _triangles[index];

    const getCurrentGroup = () => _currentGroupName;

    const setCurrentGroup = value => {
        _currentGroupName = value;
        if (!_groups[_currentGroupName]) {
            _groups[_currentGroupName] = [];
        }
        _currentGroup = _groups[_currentGroupName];
    };

    const addVertex = (x, y, z) => {
        _vertices.push(new Vector3(x, y, z));
        _vertexNormals.push(new Vector3(0, 0, 0));
    };

    const addNormal = (x, y, z) => _triangleNormals.push(new Vector3(x, y, z).normalize());

    const addUvCoordinate = function(u, v) {
        _uvCoordinates.push(new Vector3(u, v, 0));
    };

    const createTriangle = (a, b, c) => {
        const triangle = new Triangle(a, b, c);
        _triangles.push(triangle);
        _currentGroup.push(triangle);
        return triangle;
    };

    const useNormals = function(type) {
        for (let i = 0; i < _triangles.length; i++) {
            _triangles[i].useNormals(type);
        }
        return this;
    };

    const changeMaterial = function(material) {
        for (let i = 0; i < _triangles.length; i++) {
            _triangles[i].changeMaterial(material);
        }
        return this;
    };

    const compileTriangle = (triangle, indexer) => {
        const v = new Vertex();
        const vertex = _vertices[indexer.vertex];
        v.vx = vertex.x;
        v.vy = vertex.y;
        v.vz = vertex.z;
        let normal = triangle.surfaceNormal;
        if (triangle.normalType === NormalType.Vertex && _vertexNormals.length > indexer.vertex) {
            normal = _vertexNormals[indexer.vertex];
        } else if (triangle.normalType === NormalType.Triangle && _triangleNormals.length > indexer.normal) {
            normal = _triangleNormals[indexer.normal];
        }
        v.nx = normal.x;
        v.ny = normal.y;
        v.nz = normal.z;
        if (_uvCoordinates.length > indexer.texel) {
            const uvCoord = _uvCoordinates[indexer.texel];
            v.tu = uvCoord.x;
            v.tv = uvCoord.y;
        }
        return v;
    };

    const compileBuffers = optimize => {
        const meshByMaterial = new Map();
        const materialBuckets = new Map();

        for (let i = 0; i < _triangles.length; i++) {
            const material = _triangles[i].material;
            if (!materialBuckets.has(material)) {
                materialBuckets.set(material, []);
                _materials[material] = _triangles[i].material;
            }
            materialBuckets.get(material).push(_triangles[i]);
        }

        materialBuckets.forEach((val, key) => {
            const triangles = val;
            const triangleCount = triangles.length;
            const elementCount = triangleCount * 3;
            let ib = new Uint16Array(elementCount);
            let vb = new Array(elementCount);
            let idx = 0;
            for (let i = 0; i < triangleCount; i++) {
                const triangle = triangles[i];
                vb[idx] = compileTriangle(triangle, triangle.a);
                ib[idx] = idx++;
                vb[idx] = compileTriangle(triangle, triangle.b);
                ib[idx] = idx++;
                vb[idx] = compileTriangle(triangle, triangle.c);
                ib[idx] = idx++;
            }
            if (optimize) {
                const optimized = optimizer(vb, ib);
                vb = optimized.optVertices;
                ib = optimized.optTriangles;
            }
            meshByMaterial.set(key, new Mesh(new Buffer(convertVertices(vb)), new Buffer(ib)));
        });
        return meshByMaterial;
    };

    const compile = optimize => {
        for (let i = 0; i < _vertexNormals.length; ++i) {
            _vertexNormals[i].setTo(0, 0, 0);
        }

        const a = new Vector3(0, 0, 0);
        const b = new Vector3(0, 0, 0);
        for (let i = 0; i < _triangles.length; i++) {
            const triangle = _triangles[i];
            a.copy(_vertices[triangle.b.vertex]).sub(_vertices[triangle.a.vertex]);
            b.copy(_vertices[triangle.c.vertex]).sub(_vertices[triangle.b.vertex]);

            triangle.surfaceNormal.setTo(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
            triangle.surfaceNormal.normalize();

            _vertexNormals[triangle.a.vertex].add(triangle.surfaceNormal);
            _vertexNormals[triangle.b.vertex].add(triangle.surfaceNormal);
            _vertexNormals[triangle.c.vertex].add(triangle.surfaceNormal);
        }

        for (let i = 0; i < _vertexNormals.length; ++i) {
            _vertexNormals[i].normalize();
        }

        return Model(compileBuffers(optimize));
    };

    return {
        getTriangleModifierFor,
        getCurrentGroup,
        setCurrentGroup,
        addVertex,
        addNormal,
        addUvCoordinate,
        createTriangle,
        useNormals,
        changeMaterial,
        compile,
        purge
    }
};
