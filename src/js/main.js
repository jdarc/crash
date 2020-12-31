import "../css/main.css";

import Core from "./core";

import JPlane from "./physics/geometry/JPlane";
import PhysicsSystem from "./physics/physics/PhysicsSystem";
import CollisionSystemBrute from "./physics/collision/CollisionSystemBrute";
import Vector3 from "./physics/math/Vector3";
import buildScene from "./Scenery";

const handleKeyDown = (e, controller, car) => {
    controller.keyDown(e.code);
    switch (e.code) {
        case 'Space':
            car.setHBrake(1);
            return false;
        case 'ArrowUp':
            car.setAccelerate(1);
            return false;
        case 'ArrowDown':
            car.setAccelerate(-1);
            return false;
        case 'ArrowLeft':
            car.setSteer(-1);
            return false;
        case 'ArrowRight':
            car.setSteer(1);
            return false;
    }
};

const handleKeyUp = (e, controller, car) => {
    controller.keyUp(e.code);
    switch (e.code) {
        case 'Space':
            car.setHBrake(0);
            return false;
        case 'ArrowUp':
            car.setAccelerate(0);
            return false;
        case 'ArrowDown':
            car.setAccelerate(0);
            return false;
        case 'ArrowLeft':
            car.setSteer(0);
            return false;
        case 'ArrowRight':
            car.setSteer(0);
            return false;
    }
};

const run = canvas => {
    canvas.width = document.body.clientWidth;
    canvas.heigh = document.body.clientHeight;

    const _timer = new Core.StopWatch();

    const _camera = new Core.Camera(Math.PI / 4, canvas.width, canvas.height, 0.1, 4000);
    _camera.moveTo(0, 2, 40);
    _camera.lookAt(0, 2, 0);
    const _fpsCamera = new Core.CameraController(_camera);

    const _system = PhysicsSystem.getInstance();
    _system.setCollisionSystem(new CollisionSystemBrute());
    _system.setGravity(new Vector3(0, -9.8, 0));

    const ground = new JPlane(new Vector3(0, 1, 0));
    ground.setY(-10);
    ground.setMovable(false);
    ground.setFriction(0.5);
    _system.addBody(ground);

    const _engine = new Core.Engine(canvas);
    _engine.backgroundColor = 0x339a66;
    _engine.ambientColor = 0x1a1a1a;
    _engine.shadowMapping = true;
    _engine.projection(45, canvas.width / canvas.height, 1.0, 1000.0);
    _engine.worldUp(0, 1, 0);

    let _scene = null;
    let _carbody = null;

    window.addEventListener("mousemove", e => _fpsCamera.mouseMove(e.clientX, e.clientY));
    window.addEventListener("mousedown", () => _fpsCamera.mouseDown() || false);
    window.addEventListener("mouseup", () => _fpsCamera.mouseUp() || false);
    window.addEventListener("keydown", e => handleKeyDown(e, _fpsCamera, _carbody));
    window.addEventListener("keyup", e => handleKeyUp(e, _fpsCamera, _carbody));

    const resourceLoader = new Core.ResourceLoader("./");
    resourceLoader.add("chassis", "240z-chassis.obj");
    resourceLoader.add("wheel", "240z-wheel.obj");
    resourceLoader.add("crate", "crate.obj");
    resourceLoader.add("ball", "ball.obj");
    resourceLoader.load(resources => {
        const output = buildScene(resources);
        _scene = output.scene;
        _carbody = output.carbody;
        new Core.GameLoop((seconds) => {
            _timer.start();
            _system.integrate(seconds);
            _fpsCamera.update(seconds, 30);
            _scene.update(seconds);
        }, () => {
            _engine.position(_camera.eye[0], _camera.eye[1], _camera.eye[2]);
            _engine.target(_camera.center[0], _camera.center[1], _camera.center[2]);
            _engine.render(_scene);
            _timer.stop();
        }).start();
    });

};

window.addEventListener("load", () => run(document.getElementById("demo")));
