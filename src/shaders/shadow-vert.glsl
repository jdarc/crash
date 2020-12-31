attribute vec3 aVertexPosition;

uniform mat4 umModel;
uniform mat4 umView;
uniform mat4 umProj;

varying vec4 vPosition;

void main(void) {
    vPosition = umView * umModel * vec4(aVertexPosition, 1.);
    gl_Position = umProj * vPosition;
}
