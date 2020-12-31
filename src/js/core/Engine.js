import shadow_vs from "../../shaders/shadow-vert.glsl";
import shadow_fs from "../../shaders/shadow-frag.glsl";
import grey_vs from "../../shaders/grey-vert.glsl";
import grey_fs from "../../shaders/grey-frag.glsl";
import shader_vs from "../../shaders/shader-vert.glsl";
import shader_fs from "../../shaders/shader-frag.glsl";
import mixer_vs from "../../shaders/mixer-vert.glsl";
import mixer_fs from "../../shaders/mixer-frag.glsl";

import Glu from "./Glu";
import Program from "./Program";
import RasterizerGL from "./RasterizerGL";
import Vector3 from "./Vector3";

const renderDepthMap = function(scene) {
    this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._depthMap);
    this._gl.viewport(0, 0, this._shadowResolution, this._shadowResolution);
    this._gl.enable(this._gl.DEPTH_TEST);
    this._gl.enable(this._gl.CULL_FACE);
    this._gl.cullFace(this._gl.BACK);
    this._gl.depthFunc(this._gl.LEQUAL);
    this._rasterizer.useProgram(this._depthProgram);
    this._depthProgram.setViewMatrix(this._lightViewMatrix);
    this._depthProgram.setProjectionMatrix(this._lightProjMatrix);
    this._gl.clearColor(0, 0, 0, 1);
    this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
    this._rasterizer.updateFrustum(this._lightViewMatrix, this._lightProjMatrix);
    scene.render(this._rasterizer);
};

const renderLightView = function(viewMatrix, scene) {
    this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._greyMap);
    this._gl.viewport(0, 0, this._gl.canvas.width, this._gl.canvas.height);
    this._gl.enable(this._gl.DEPTH_TEST);
    this._gl.enable(this._gl.CULL_FACE);
    this._gl.cullFace(this._gl.BACK);
    this._gl.depthFunc(this._gl.LEQUAL);
    this._rasterizer.useProgram(this._greyProgram);
    this._greyProgram.setLight(this._light.x, this._light.y, this._light.z);
    this._greyProgram.setViewMatrix(viewMatrix);
    this._greyProgram.setProjectionMatrix(this._projMatrix);
    this._greyProgram.setLightViewMatrix(this._lightViewMatrix);
    this._greyProgram.setLightProjectionMatrix(this._lightProjMatrix);
    this._greyProgram.bindDepthMap(this._depthMap.colorBuffer);
    this._rasterizer.updateFrustum(viewMatrix, this._projMatrix);
    this._gl.clearColor(1, 1, 1, 1);
    this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
    scene.render(this._rasterizer);
};

const renderDiffuse = function(viewMatrix, scene) {
    this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._shadeMap);
    this._gl.viewport(0, 0, this._gl.canvas.width, this._gl.canvas.height);
    this._gl.enable(this._gl.DEPTH_TEST);
    this._gl.enable(this._gl.CULL_FACE);
    this._gl.cullFace(this._gl.BACK);
    this._gl.depthFunc(this._gl.LEQUAL);
    this._rasterizer.useProgram(this._program);
    this._program.setLight(this._light.x, this._light.y, this._light.z);
    this._program.setViewMatrix(viewMatrix);
    this._program.setProjectionMatrix(this._projMatrix);
    this._rasterizer.updateFrustum(viewMatrix, this._projMatrix);
    this._gl.clearColor((this._backgroundColor >> 0x10 & 0xFF) / 255.0, (this._backgroundColor >> 0x8 & 0xFF) / 255.0, (this._backgroundColor & 0xFF) / 255.0, 1);
    this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
    scene.render(this._rasterizer);
};

const renderComposite = function() {
    this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    this._gl.viewport(0, 0, this._gl.canvas.width, this._gl.canvas.height);
    this._mixerProgram.use();
    this._mixerProgram.bindVertexBuffer2D(this._quad2DBuffer);
    this._mixerProgram.bindMaterial(this._shadeMap.colorBuffer);
    this._mixerProgram.bindDepthMap(this._greyMap.colorBuffer);
    this._gl.drawArrays(this._gl.TRIANGLE_STRIP, 0, 4);
};

export default class Engine {
    constructor(canvas) {
        this._gl = canvas.getContext("webgl");
        this._glu = new Glu(this._gl);

        this._program = new Program(this._glu, shader_vs, shader_fs);
        this._greyProgram = new Program(this._glu, grey_vs, grey_fs);
        this._depthProgram = new Program(this._glu, shadow_vs, shadow_fs);
        this._mixerProgram = new Program(this._glu, mixer_vs, mixer_fs);

        this._shadowResolution = 2048;
        this._rasterizer = new RasterizerGL(this._glu);
        this._depthMap = this._glu.createTextureFramebuffer(this._shadowResolution, this._shadowResolution);
        this._shadeMap = this._glu.createTextureFramebuffer(canvas.width, canvas.height);
        this._greyMap = this._glu.createTextureFramebuffer(canvas.width, canvas.height);
        this._quad2DBuffer = this._glu.createVertexBuffer(new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]));

        this._backgroundColor = 0x000000;
        this._ambientColor = 0x080808;

        this._projMatrix = new Float32Array(16);
        this._viewMatrix = new Float32Array(16);

        this._lightProjMatrix = new Float32Array(16);
        this._lightViewMatrix = new Float32Array(16);

        this._position = new Vector3(0, 0, 1);
        this._target = new Vector3(0, 0, 0);
        this._up = new Vector3(0, 1, 0);

        this._light = new Vector3(0, 1, 0);
        this._shadowMapping = true;
        this._dirty = true;

        this.light(117.5, 70.5, 70);
    }

    _computeViewMatrix() {
        if (this._dirty) {
            let z0 = this._position.x - this._target.x;
            let z1 = this._position.y - this._target.y;
            let z2 = this._position.z - this._target.z;
            let len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
            z0 *= len;
            z1 *= len;
            z2 *= len;

            let x0 = this._up.y * z2 - this._up.z * z1;
            let x1 = this._up.z * z0 - this._up.x * z2;
            let x2 = this._up.x * z1 - this._up.y * z0;
            len = 1 / Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
            x0 *= len;
            x1 *= len;
            x2 *= len;

            let y0 = z1 * x2 - z2 * x1;
            let y1 = z2 * x0 - z0 * x2;
            let y2 = z0 * x1 - z1 * x0;
            len = 1 / Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
            y0 *= len;
            y1 *= len;
            y2 *= len;

            this._viewMatrix[0] = x0;
            this._viewMatrix[1] = y0;
            this._viewMatrix[2] = z0;
            this._viewMatrix[3] = 0;
            this._viewMatrix[4] = x1;
            this._viewMatrix[5] = y1;
            this._viewMatrix[6] = z1;
            this._viewMatrix[7] = 0;
            this._viewMatrix[8] = x2;
            this._viewMatrix[9] = y2;
            this._viewMatrix[10] = z2;
            this._viewMatrix[11] = 0;
            this._viewMatrix[12] = -(x0 * this._position.x + x1 * this._position.y + x2 * this._position.z);
            this._viewMatrix[13] = -(y0 * this._position.x + y1 * this._position.y + y2 * this._position.z);
            this._viewMatrix[14] = -(z0 * this._position.x + z1 * this._position.y + z2 * this._position.z);
            this._viewMatrix[15] = 1;
            this._dirty = false;
        }

        return this._viewMatrix;
    }

    worldUp(x, y, z) {
        this._up.setTo(x, y, z);
        this._dirty = true;
    }

    position(x, y, z) {
        this._position.setTo(x, y, z);
        this._dirty = true;
    }

    target(x, y, z) {
        this._target.setTo(x, y, z);
        this._dirty = true;
    }

    projection(fovy, aspect, zNear, zFar) {
        const f = 1.0 / Math.tan(fovy * Math.PI / 360.0);
        this._projMatrix[0] = f / aspect;
        this._projMatrix[5] = f;
        this._projMatrix[10] = -(zFar + zNear) / (zFar - zNear);
        this._projMatrix[11] = -1;
        this._projMatrix[14] = -(2 * zFar * zNear) / (zFar - zNear);
    }

    light(x, y, z) {
        this._light.setTo(x, y, z);
        let z0 = this._light.x - 0;
        let z1 = this._light.y - 0;
        let z2 = this._light.z - 0;
        let len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
        z0 *= len;
        z1 *= len;
        z2 *= len;

        let x0 = this._up.y * z2 - this._up.z * z1;
        let x1 = this._up.z * z0 - this._up.x * z2;
        let x2 = this._up.x * z1 - this._up.y * z0;
        len = 1 / Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
        x0 *= len;
        x1 *= len;
        x2 *= len;

        let y0 = z1 * x2 - z2 * x1;
        let y1 = z2 * x0 - z0 * x2;
        let y2 = z0 * x1 - z1 * x0;
        len = 1 / Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
        y0 *= len;
        y1 *= len;
        y2 *= len;

        this._lightViewMatrix[0] = x0;
        this._lightViewMatrix[1] = y0;
        this._lightViewMatrix[2] = z0;
        this._lightViewMatrix[3] = 0;
        this._lightViewMatrix[4] = x1;
        this._lightViewMatrix[5] = y1;
        this._lightViewMatrix[6] = z1;
        this._lightViewMatrix[7] = 0;
        this._lightViewMatrix[8] = x2;
        this._lightViewMatrix[9] = y2;
        this._lightViewMatrix[10] = z2;
        this._lightViewMatrix[11] = 0;
        this._lightViewMatrix[12] = -(x0 * this._light.x + x1 * this._light.y + x2 * this._light.z);
        this._lightViewMatrix[13] = -(y0 * this._light.x + y1 * this._light.y + y2 * this._light.z);
        this._lightViewMatrix[14] = -(z0 * this._light.x + z1 * this._light.y + z2 * this._light.z);
        this._lightViewMatrix[15] = 1;

        const zNear = 1.0;
        const zFar = 1000.0;
        const f = 1.0 / Math.tan(45 * Math.PI / 360.0);
        this._lightProjMatrix[0] = f;
        this._lightProjMatrix[5] = f;
        this._lightProjMatrix[10] = -(zFar + zNear) / (zFar - zNear);
        this._lightProjMatrix[11] = -1;
        this._lightProjMatrix[14] = -(2 * zFar * zNear) / (zFar - zNear);
    }

    render(scene) {
        const viewMatrix = this._computeViewMatrix();
        renderDepthMap.call(this, scene);
        renderLightView.call(this, viewMatrix, scene);
        renderDiffuse.call(this, viewMatrix, scene);
        renderComposite.call(this);
    }

    get backgroundColor() {
        return this._backgroundColor;
    }

    set backgroundColor(val) {
        this._backgroundColor = val;
    }

    get ambientColor() {
        return this._ambientColor;
    }

    set ambientColor(val) {
        this._ambientColor = val;
    }

    get shadowMapping() {
        return this._shadowMapping;
    }

    set shadowMapping(val) {
        this._shadowMapping = val;
    }

    get shadowResolution() {
        return this._shadowResolution;
    }

    set shadowResolution(val) {
        this._shadowResolution = val;
    }
}
