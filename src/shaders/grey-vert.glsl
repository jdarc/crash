const mat4 ScaleMatrix = mat4(.5, 0., 0., 0., 0., .5, 0., 0., 0., 0., .5, 0., .5, .5, .5, 1.);

attribute vec3 aVertexPosition;

uniform mat4 umModel;
uniform mat4 umView;
uniform mat4 umProj;
uniform mat4 umLightProj;
uniform mat4 umLightView;

varying vec4 vWorldVertex;
varying vec4 vPosition;

void main(){
    vWorldVertex = umModel * vec4(aVertexPosition, 1.);
    vPosition = ScaleMatrix * umLightProj * umLightView * vWorldVertex;
    gl_Position = umProj * umView * vWorldVertex;
}
