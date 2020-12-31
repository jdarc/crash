import Matrix44 from "./Matrix44";
import Vector3 from "./Vector3";

const MOVE_FORWARD = 1;
const MOVE_BACKWARD = 2;
const MOVE_LEFT = 4;
const MOVE_RIGHT = 8;

export default function(camera) {
    const _camera = camera;
    let _movementMask = 0;
    let _lastMouseX = 0;
    let _lastMouseY = 0;
    let _currMouseX = 0;
    let _currMouseY = 0;
    let _yaw = 0;
    let _pitch = 0;
    let _dragging = false;
    const _rotX = new Matrix44();
    const _temp = new Vector3();
    const _side = new Vector3();
    const _lookAt = new Vector3(_camera.center[0] - _camera.eye[0], _camera.center[1] - _camera.eye[1], _camera.center[2] - _camera.eye[2]).normalize();

    return {
        keyUp(code) {
            switch (code) {
                case 'KeyW':
                    _movementMask ^= MOVE_FORWARD;
                    break;
                case 'KeyS':
                    _movementMask ^= MOVE_BACKWARD;
                    break;
                case 'KeyA':
                    _movementMask ^= MOVE_LEFT;
                    break;
                case 'KeyD':
                    _movementMask ^= MOVE_RIGHT;
                    break;
            }
        },
        keyDown(code) {
            switch (code) {
                case 'KeyW':
                    _movementMask |= MOVE_FORWARD;
                    break;
                case 'KeyS':
                    _movementMask |= MOVE_BACKWARD;
                    break;
                case 'KeyA':
                    _movementMask |= MOVE_LEFT;
                    break;
                case 'KeyD':
                    _movementMask |= MOVE_RIGHT;
                    break;
            }
        },
        mouseDown() {
            _dragging = true;
        },
        mouseMove(x, y) {
            _currMouseX = x;
            _currMouseY = y;
        },
        mouseUp() {
            _dragging = false;
        },
        update(seconds, speed) {
            const scaledSpeed = seconds * speed;

            if (_dragging) {
                const dx = Math.abs(_currMouseX - _lastMouseX) * seconds * 0.25;
                const dy = Math.abs(_currMouseY - _lastMouseY) * seconds * 0.25;
                _yaw += _currMouseX < _lastMouseX ? dx : -dx;
                _pitch += _currMouseY < _lastMouseY ? dy : -dy;
                _pitch = Math.max(-1.55, Math.min(1.55, _pitch));
                _rotX.multiply(Matrix44.createRotationAboutY(_yaw), Matrix44.createRotationAboutX(_pitch));
                _lookAt.setTo(0, 0, -1).transform(_lookAt, _rotX).normalize();
            }
            _lastMouseX = _currMouseX;
            _lastMouseY = _currMouseY;

            _temp.setTo(_camera.eye[0], _camera.eye[1], _camera.eye[2]);
            _side.setTo(0, 1, 0).cross(_lookAt, _side).normalize().mul(scaledSpeed);

            if ((_movementMask & MOVE_FORWARD) === MOVE_FORWARD) {
                _temp.setTo(_temp.x + _lookAt.x * scaledSpeed, _temp.y + _lookAt.y * scaledSpeed, _temp.z + _lookAt.z * scaledSpeed);
            }

            if ((_movementMask & MOVE_BACKWARD) === MOVE_BACKWARD) {
                _temp.setTo(_temp.x - _lookAt.x * scaledSpeed, _temp.y - _lookAt.y * scaledSpeed, _temp.z - _lookAt.z * scaledSpeed);
            }

            if ((_movementMask & MOVE_LEFT) === MOVE_LEFT) {
                _temp.sub(_side);
            }

            if ((_movementMask & MOVE_RIGHT) === MOVE_RIGHT) {
                _temp.add(_side);
            }

            _camera.moveTo(_temp.x, _temp.y, _temp.z);
            _camera.lookAt(_temp.x + _lookAt.x, _temp.y + _lookAt.y, _temp.z + _lookAt.z);
        }
    }
};
