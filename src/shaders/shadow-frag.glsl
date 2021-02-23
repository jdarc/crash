precision highp float;

const float Near = 1.;
const float Far = 1000.;
const float LinearDepthConstant = 1. / (Far - Near);

varying vec4 vPosition;

vec4 pack(const in float depth){
    const vec4 bit_shift = vec4(16777216., 65536., 256., 1.);
    const vec4 bit_mask  = vec4(0., 1./256., 1./256., 1./256.);
    vec4 res = fract(depth * bit_shift);
    return res - res.xxyz * bit_mask;
}

void main() {
    gl_FragColor = pack(length(vPosition) * LinearDepthConstant);
}
