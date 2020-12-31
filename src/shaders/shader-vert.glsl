const mat4 ScaleMatrix = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);

uniform mat4 umModel;
uniform mat3 umNorm;
uniform mat4 umView;
uniform mat4 umProj;
uniform mat4 umLightProj;
uniform mat4 umLightView;

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

varying vec4 vWorldVertex;
varying vec3 vWorldNormal;
varying vec2 vUv;
varying vec4 vPosition;

void main(void) {
    vUv = aTextureCoord;
    vWorldNormal = normalize(umNorm * aVertexNormal);
    vWorldVertex = umModel * vec4(aVertexPosition, 1.0);
    vPosition = ScaleMatrix * umLightProj * umLightView * vWorldVertex;
    gl_Position = umProj * umView * vWorldVertex;
}
