export default {
    NUM_TINY: 1E-6,
    NUM_HUGE: 1E6,
    wrap: (val, min, max) => {
        const delta = max - min;
        while (val < min) val += delta;
        while (val > max) val -= delta;
        return val;
    },
    sq: val => val * val,
    sqrt: val => Math.sqrt(val)
}
