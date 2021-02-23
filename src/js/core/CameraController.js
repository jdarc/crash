const MOVE_FORWARD = 0x1;
const MOVE_BACKWARD = 0x2;
const MOVE_LEFT = 0x4;
const MOVE_RIGHT = 0x8;

export default function(camera) {
    let movementMask = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let dragging = false;
    let yaw = 0;
    let pitch = 0;

    return {
        keyUp(code) {
            switch (code) {
                case 'KeyW':
                    movementMask ^= MOVE_FORWARD;
                    break;
                case 'KeyS':
                    movementMask ^= MOVE_BACKWARD;
                    break;
                case 'KeyA':
                    movementMask ^= MOVE_LEFT;
                    break;
                case 'KeyD':
                    movementMask ^= MOVE_RIGHT;
                    break;
            }
        },
        keyDown(code) {
            switch (code) {
                case 'KeyW':
                    movementMask |= MOVE_FORWARD;
                    break;
                case 'KeyS':
                    movementMask |= MOVE_BACKWARD;
                    break;
                case 'KeyA':
                    movementMask |= MOVE_LEFT;
                    break;
                case 'KeyD':
                    movementMask |= MOVE_RIGHT;
                    break;
            }
        },
        mouseDown() {
            dragging = true;
        },
        mouseMove(x, y) {
            if (dragging) {
                yaw -= (x - lastMouseX) * 0.005;
                pitch -= (y - lastMouseY) * 0.005;
                pitch = Math.max(-1.57, Math.min(1.57, pitch));
            }
            lastMouseX = x;
            lastMouseY = y;
        },
        mouseUp() {
            dragging = false;
        },
        update(seconds, speed) {
            const scaled = seconds * speed;

            const lookX = -Math.sin(yaw) * Math.cos(pitch);
            const lookY = Math.sin(pitch);
            const lookZ = -Math.cos(yaw) * Math.cos(pitch);

            let [x, y, z] = camera.eye;
            if ((movementMask & 1) === 1) {
                x += lookX * scaled;
                y += lookY * scaled;
                z += lookZ * scaled;
            } else if ((movementMask & 2) === 2) {
                x -= lookX * scaled;
                y -= lookY * scaled;
                z -= lookZ * scaled;
            }

            const scalar = scaled / Math.sqrt(lookZ * lookZ + lookX * lookX);
            if ((movementMask & 4) === 4) {
                x += lookZ * scalar;
                z -= lookX * scalar;
            } else if ((movementMask & 8) === 8) {
                x -= lookZ * scalar;
                z += lookX * scalar;
            }

            camera.moveTo(x, y, z);
            camera.lookAt(x + lookX, y + lookY, z + lookZ);
        }
    }
};
