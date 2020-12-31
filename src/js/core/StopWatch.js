export default function() {
    let a = 0;
    let b = 0;
    return {
        start() {
            a = b = performance.now();
        }, stop() {
            b = performance.now();
        }, getDuration() {
            return b - a;
        }
    }
}
