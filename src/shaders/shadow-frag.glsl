precision highp float;

const float Near = 1.;
const float Far = 1000.;
const float LinearDepthConstant = 1. / (Far - Near);

varying vec4 vPosition;

vec4 pack(const in float depth){
    const vec4 bit_shift = vec4(256. * 256. * 256., 256. * 256., 256., 1.);
    const vec4 bit_mask  = vec4(0., 1. / 256., 1. / 256., 1. / 256.);
    vec4 res = fract(depth * bit_shift);
    res -= res.xxyz * bit_mask;
    return res;
}

void main(void) {
    float linearDepth = length(vPosition) * LinearDepthConstant;
    gl_FragColor = pack(linearDepth);
}
