import shadow_vs from "../../shaders/shadow-vert.glsl";
import shadow_fs from "../../shaders/shadow-frag.glsl";
import grey_vs from "../../shaders/grey-vert.glsl";
import grey_fs from "../../shaders/grey-frag.glsl";
import shader_vs from "../../shaders/shader-vert.glsl";
import shader_fs from "../../shaders/shader-frag.glsl";
import mixer_vs from "../../shaders/mixer-vert.glsl";
import mixer_fs from "../../shaders/mixer-frag.glsl";

import Glu from "../webgl/Glu";
import Program from "./Program";
import RasterizerGL from "./RasterizerGL";
import Vector3 from "../math/Vector3";
import Matrix4 from "../math/Matrix4";

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
        this._quad2DBuffer = this._glu.createVertexBuffer(new Float32Array([ -1, -1, 1, -1, -1, 1, 1, 1 ]));

        this._backgroundColor = 0x000000;

        this._projMatrix = new Float32Array(16);
        this._viewMatrix = new Float32Array(16);
        this._lightProjMatrix = new Float32Array(16);
        this._lightViewMatrix = new Float32Array(16);

        this._position = new Vector3(0, 0, 1);
        this._target = new Vector3(0, 0, 0);
        this._up = new Vector3(0, 1, 0);

        this._light = new Vector3(0, 1, 0);
        this._dirty = true;

        this.moveLightTo(115, 200, 60);
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
        Matrix4.generatePerspectiveFov(fovy, aspect, zNear, zFar, this._projMatrix);
    }

    moveLightTo(x, y, z) {
        this._light.setTo(x, y, z);
        Matrix4.generateViewMatrix(this._light, new Vector3(0, 1, 0), this._up, this._lightViewMatrix);
        Matrix4.generatePerspectiveFov(45, 1, 1, 1000, this._lightProjMatrix);
    }

    render(scene) {
        if (this._dirty) {
            Matrix4.generateViewMatrix(this._position, this._target, this._up, this._viewMatrix)
            this._dirty = false;
        }

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
        scene.render(this._rasterizer);

        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._greyMap);
        this._gl.viewport(0, 0, this._gl.canvas.width, this._gl.canvas.height);
        this._gl.enable(this._gl.DEPTH_TEST);
        this._gl.enable(this._gl.CULL_FACE);
        this._gl.cullFace(this._gl.BACK);
        this._gl.depthFunc(this._gl.LEQUAL);
        this._rasterizer.useProgram(this._greyProgram);
        this._greyProgram.setLight(this._light.x, this._light.y, this._light.z);
        this._greyProgram.setViewMatrix(this._viewMatrix);
        this._greyProgram.setProjectionMatrix(this._projMatrix);
        this._greyProgram.setLightViewMatrix(this._lightViewMatrix);
        this._greyProgram.setLightProjectionMatrix(this._lightProjMatrix);
        this._greyProgram.bindDepthMap(this._depthMap.colorBuffer);
        this._gl.clearColor(1, 1, 1, 1);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
        scene.render(this._rasterizer);

        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._shadeMap);
        this._gl.viewport(0, 0, this._gl.canvas.width, this._gl.canvas.height);
        this._gl.enable(this._gl.DEPTH_TEST);
        this._gl.enable(this._gl.CULL_FACE);
        this._gl.cullFace(this._gl.BACK);
        this._gl.depthFunc(this._gl.LEQUAL);
        this._rasterizer.useProgram(this._program);
        this._program.setLight(this._light.x, this._light.y, this._light.z);
        this._program.setViewMatrix(this._viewMatrix);
        this._program.setProjectionMatrix(this._projMatrix);
        this._gl.clearColor((this._backgroundColor >> 0x10 & 0xFF) / 255.0, (this._backgroundColor >> 0x8 & 0xFF) / 255.0, (this._backgroundColor & 0xFF) / 255.0, 1);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
        scene.render(this._rasterizer);

        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
        this._gl.viewport(0, 0, this._gl.canvas.width, this._gl.canvas.height);
        this._mixerProgram.use();
        this._mixerProgram.bindVertexBuffer2D(this._quad2DBuffer);
        this._mixerProgram.bindMaterial(this._shadeMap.colorBuffer);
        this._mixerProgram.bindDepthMap(this._greyMap.colorBuffer);
        this._gl.drawArrays(this._gl.TRIANGLE_STRIP, 0, 4);
    }

    get backgroundColor() {
        return this._backgroundColor;
    }

    set backgroundColor(val) {
        this._backgroundColor = val;
    }
}
