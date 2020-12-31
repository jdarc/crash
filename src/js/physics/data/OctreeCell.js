import JAABox from "../geometry/JAABox";

export default class OctreeCell {
    constructor(aabox) {
        this.childCellIndices = [-1, -1, -1, -1, -1, -1, -1, -1];
        this.triangleIndices = [];
        this.clear();
        this.Aabox = aabox ? aabox.clone() : new JAABox();
        this._points = this.Aabox.getAllPoints();
        this._egdes = this.Aabox.getEdges();
    }

    isLeaf() {
        return this.childCellIndices[0] === -1;
    }

    clear() {
        for (let i = 0; i < OctreeCell.NUM_CHILDREN; i++) {
            this.childCellIndices[i] = -1;
        }
        this.triangleIndices.splice(0, this.triangleIndices.length);
    }

    get_points() {
        return this._points;
    }

    get_egdes() {
        return this._egdes;
    }
}

OctreeCell.NUM_CHILDREN = 8;
