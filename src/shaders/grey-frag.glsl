precision highp float;

const float Near = 1.;
const float Far = 1000.;
const float LinearDepthConstant = 1. / (Far - Near);

uniform sampler2D uDepthMap;
uniform vec3 uLightingDirection;

varying vec4 vWorldVertex;
varying vec4 vPosition;

float unpack(const in vec4 rgba_depth){
    const vec4 bit_shift = vec4(1./(256.*256.*256.), 1./(256.*256.), 1./256., 1.);
    return dot(rgba_depth, bit_shift);
}

void main(){
    vec3 depth = vPosition.xyz / vPosition.w;
    depth.z = length(vWorldVertex.xyz - uLightingDirection) * LinearDepthConstant;
    const float texelSize = 1. / 2048.;
    float shadow = 0.;
    if (vPosition.z >= 0.){
        shadow = 9.;
        for (int y = -1; y <= 1; ++y){
            for (int x = -1; x <= 1; ++x){
                vec2 offset = depth.xy + vec2(float(x) * texelSize, float(y) * texelSize);
                if ((offset.x >= 0.) && (offset.x <= 1.) && (offset.y >= 0.) && (offset.y <= 1.)){
                    float shadowDepth = unpack(texture2D(uDepthMap, offset));
                    shadow -= depth.z > shadowDepth ? 1. : 0.;
                }
                else {
                    shadow -= 1.;
                }
            }
        }
        shadow /= 9.;
    }
    gl_FragColor = vec4(shadow, shadow, shadow, 1.);
}
