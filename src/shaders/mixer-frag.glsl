precision mediump float;

uniform sampler2D uSampler;
uniform sampler2D uDepthMap;

varying vec2 vTexCoord;

void main() {
    vec4 greys = texture2D(uDepthMap, vTexCoord);
    vec4 texel = texture2D(uSampler, vTexCoord);
    gl_FragColor = vec4((.4 * texel.rgb) + texel.rgb * texel.a * greys.r, 1.);
}
