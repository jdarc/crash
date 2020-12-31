export default class Program {
    constructor(glu, vs, fs) {
        this._gl = glu.context;
        this._shaderProgram = glu.createProgram(vs, fs);

        this._shaderProgram.vertexPositionAttribute = this._gl.getAttribLocation(this._shaderProgram, "aVertexPosition");
        this._shaderProgram.vertexNormalAttribute = this._gl.getAttribLocation(this._shaderProgram, "aVertexNormal");
        this._shaderProgram.vertexTextureCoordAttribute = this._gl.getAttribLocation(this._shaderProgram, "aTextureCoord");
        this._shaderProgram.uSampler = this._gl.getUniformLocation(this._shaderProgram, "uSampler");
        this._shaderProgram.uDepthSampler = this._gl.getUniformLocation(this._shaderProgram, "uDepthMap");

        this.mUniform = this._gl.getUniformLocation(this._shaderProgram, "umModel");
        this.nUniform = this._gl.getUniformLocation(this._shaderProgram, "umNorm");
        this.vUniform = this._gl.getUniformLocation(this._shaderProgram, "umView");
        this.pUniform = this._gl.getUniformLocation(this._shaderProgram, "umProj");
        this.lvUniform = this._gl.getUniformLocation(this._shaderProgram, "umLightView");
        this.lpUniform = this._gl.getUniformLocation(this._shaderProgram, "umLightProj");
        this.lightUniform = this._gl.getUniformLocation(this._shaderProgram, "uLightingDirection");
    }

    use() {
        this._gl.useProgram(this._shaderProgram);
        if (this._shaderProgram.vertexPositionAttribute !== -1) {
            this._gl.enableVertexAttribArray(this._shaderProgram.vertexPositionAttribute);
        }
        if (this._shaderProgram.vertexNormalAttribute !== -1) {
            this._gl.enableVertexAttribArray(this._shaderProgram.vertexNormalAttribute);
        }
        if (this._shaderProgram.vertexTextureCoordAttribute !== -1) {
            this._gl.enableVertexAttribArray(this._shaderProgram.vertexTextureCoordAttribute);
        }
    }

    setWorldMatrix(matrix) {
        if (this.mUniform) this._gl.uniformMatrix4fv(this.mUniform, false, matrix);
    }

    setNormalMatrix(matrix) {
        if (this.nUniform) this._gl.uniformMatrix3fv(this.nUniform, false, matrix);
    }

    setViewMatrix(matrix) {
        if (this.vUniform) this._gl.uniformMatrix4fv(this.vUniform, false, matrix);
    }

    setProjectionMatrix(matrix) {
        if (this.pUniform) this._gl.uniformMatrix4fv(this.pUniform, false, matrix);
    }

    setLightViewMatrix(matrix) {
        if (this.lvUniform) this._gl.uniformMatrix4fv(this.lvUniform, false, matrix);
    }

    setLightProjectionMatrix(matrix) {
        if (this.lpUniform) this._gl.uniformMatrix4fv(this.lpUniform, false, matrix);
    }

    setLight(x, y, z) {
        if (this.lightUniform) this._gl.uniform3f(this.lightUniform, x, y, z);
    }

    bindIndexBuffer(buffer) {
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, buffer);
    }

    bindVertexBuffer(buffer) {
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer);
        if (this._shaderProgram.vertexPositionAttribute !== -1) {
            this._gl.vertexAttribPointer(this._shaderProgram.vertexPositionAttribute, 3, this._gl.FLOAT, false, 32, 0);
        }
        if (this._shaderProgram.vertexNormalAttribute !== -1) {
            this._gl.vertexAttribPointer(this._shaderProgram.vertexNormalAttribute, 3, this._gl.FLOAT, false, 32, 12);
        }
        if (this._shaderProgram.vertexTextureCoordAttribute !== -1) {
            this._gl.vertexAttribPointer(this._shaderProgram.vertexTextureCoordAttribute, 2, this._gl.FLOAT, false, 32, 24);
        }
    }

    bindVertexBuffer2D(buffer) {
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer);
        if (this._shaderProgram.vertexPositionAttribute !== -1) {
            this._gl.vertexAttribPointer(this._shaderProgram.vertexPositionAttribute, 2, this._gl.FLOAT, false, 0, 0);
        }
    }

    bindMaterial(material) {
        if (this._shaderProgram.uSampler) {
            this._gl.activeTexture(this._gl.TEXTURE0);
            this._gl.uniform1i(this._shaderProgram.uSampler, 0);
            this._gl.bindTexture(this._gl.TEXTURE_2D, material);
        }
    }

    bindDepthMap(material) {
        if (this._shaderProgram.uDepthSampler) {
            this._gl.activeTexture(this._gl.TEXTURE1);
            this._gl.uniform1i(this._shaderProgram.uDepthSampler, 1);
            this._gl.bindTexture(this._gl.TEXTURE_2D, material);
        }
    }
}


