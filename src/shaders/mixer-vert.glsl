attribute vec2 aVertexPosition;
varying vec2 vTexCoord;

void main() {
    vTexCoord = aVertexPosition * .5 + .5;
    gl_Position = vec4(aVertexPosition, 0., 1.);
}
