export default function(update, render) {
    let tock;
    let running = false;

    const loop = timestamp => {
        const tick = tock || timestamp;
        tock = timestamp;
        update((tock - tick) / 1000.0);
        render();
        if (running) requestAnimationFrame(loop);
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
