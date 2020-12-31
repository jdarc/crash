export default class Mesh {
    constructor(vertexBuffer, indexBuffer) {
        this._vertexBuffer = vertexBuffer;
        this._indexBuffer = indexBuffer;
    }

    get vertexCount() {
        return this._vertexBuffer.data.length / 8;
    }

    get triangleCount() {
        return this._indexBuffer.data.length / 3;
    }

    computeLocalBounds(bounds) {
        const data = this._vertexBuffer.data;
        for (let i = 0; i < data.length; i += 8) {
            bounds.aggregate(data[i], data[i + 1], data[i + 2]);
        }
    }

    render(renderer, material) {
        renderer.draw(this._vertexBuffer, this._indexBuffer, material);
    }
}



