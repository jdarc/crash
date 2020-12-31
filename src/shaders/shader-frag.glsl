precision highp float;

uniform sampler2D uSampler;
uniform vec3 uLightingDirection;

varying vec2 vUv;
varying vec3 vWorldNormal;
varying vec4 vWorldVertex;

void main() {
    vec4 color = texture2D(uSampler, vUv);
    color.a = min(max(dot(normalize(vWorldNormal), normalize(uLightingDirection - vWorldVertex.xyz)), 0.), 1.);
    gl_FragColor = color;
}
