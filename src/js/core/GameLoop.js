export default function(update, render) {
    let tock;
    let running = false;

    const loop = timestamp => {
        if (running) requestAnimationFrame(loop);
        const tick = tock || timestamp;
        tock = timestamp;
        update((tock - tick) / 1000.0);
        render((tock - tick) / 1000.0);
    };

    return {
        start() {
            if (running) return;
            running = true;
            requestAnimationFrame(loop);
        },
        stop() {
            running = false;
        }
    }
}
