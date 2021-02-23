export default class RasterizerGL {
    constructor(glu) {
        this._glu = glu;
        this._normalMatrix = new Float32Array(9);
        this._program = null;
    }

    useProgram(program) {
        this._program = program;
        this._program.use();
    }

    world(value) {
        const b00 = value[0] * value[5] - value[1] * value[4];
        const b01 = value[0] * value[6] - value[2] * value[4];
        const b03 = value[1] * value[6] - value[2] * value[5];
        const invDet = 1 / (b00 * value[10] - b01 * value[9] + b03 * value[8]);
        this._normalMatrix[0] = (value[5] * value[10] - value[6] * value[9]) * invDet;
        this._normalMatrix[1] = (-value[4] * value[10] + value[6] * value[8]) * invDet;
        this._normalMatrix[2] = (value[4] * value[9] - value[5] * value[8]) * invDet;
        this._normalMatrix[3] = (-value[1] * value[10] + value[2] * value[9]) * invDet;
        this._normalMatrix[4] = (value[0] * value[10] - value[2] * value[8]) * invDet;
        this._normalMatrix[5] = (-value[0] * value[9] + value[1] * value[8]) * invDet;
        this._normalMatrix[6] = b03 * invDet;
        this._normalMatrix[7] = -b01 * invDet;
        this._normalMatrix[8] = b00 * invDet;

        this._program.setWorldMatrix(value);
        this._program.setNormalMatrix(this._normalMatrix);
    }

    draw(vertexBuffer, indexBuffer, material) {
        const glu = this._glu;

        indexBuffer.buffer = indexBuffer.buffer || glu.createIndexBuffer(indexBuffer.data);
        this._program.bindIndexBuffer(indexBuffer.buffer);

        vertexBuffer.buffer = vertexBuffer.buffer || glu.createVertexBuffer(vertexBuffer.data);
        this._program.bindVertexBuffer(vertexBuffer.buffer);

        material.texture = material.texture || material.image && glu.createTexture(material.image);
        this._program.bindMaterial(material.texture);

        glu.context.drawElements(glu.context.TRIANGLES, indexBuffer.data.length, glu.context.UNSIGNED_SHORT, 0);
    }
}
