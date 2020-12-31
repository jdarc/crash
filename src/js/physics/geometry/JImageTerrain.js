const ITerrain = require("./ITerrain");

export default class JImageTerrain extends ITerrain {
    constructor(image, width, height, depth) {
        super();
        this._img = new Image();
        this._img.src = image;
        this._heightData = null;

        const domImg = new Image();
        const that = this;
        domImg.onload = function() {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext('2d');
            canvas.width = this.width;
            canvas.height = this.height;
            context.drawImage(this, 0, 0);
            that._heightData = context.getImageData(0, 0, this.width, this.height).data;
        };
        domImg.src = image;

        this._height = height;
        this._width = width;
        this._depth = depth;
        this._minW = -width + width / 2;
        this._maxW = width / 2;
        this._minH = -height + height / 2;
        this._maxH = height / 2;
    }

    get_minW() {
        return this._minW;
    }

    get_minH() {
        return this._minH;
    }

    get_maxW() {
        return this._maxW;
    }

    get_maxH() {
        return this._maxH;
    }

    get_dw() {
        return this._width / this._img.width;
    }

    get_dh() {
        return this._height / this._img.height;
    }

    get_sw() {
        return this._img.width;
    }

    get_sh() {
        return this._img.height;
    }

    get_heights(i, j) {
        if (this._heightData) {
            let data = this._img.width * (j | 0) + (i | 0) << 2;
            data >>= 8;
            return this._heightData[data] / 255 * this._depth;
        } else {
            return this._depth;
        }
    }
}
