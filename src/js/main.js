import "../css/main.css";

import buildScene from "./Scenery";

import Camera from "./core/Camera";
import Engine from "./core/Engine";
import GameLoop from "./core/GameLoop";
import ResourceLoader from "./core/ResourceLoader";
import CameraController from "./core/CameraController";

import Vector3 from "./math/Vector3";

import JPlane from "./physics/geometry/JPlane";
import PhysicsSystem from "./physics/physics/PhysicsSystem";
import CollisionSystemBrute from "./physics/collision/CollisionSystemBrute";

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

const start = (physicsSystem, cameraController, world, engine, camera) => {
    new GameLoop(seconds => {
        physicsSystem.integrate(seconds);
        cameraController.update(seconds, 30);
        world.update(seconds);
    }, () => {
        engine.position(camera.eye[0], camera.eye[1], camera.eye[2]);
        engine.target(camera.center[0], camera.center[1], camera.center[2]);
        engine.render(world);
    }).start();
};

const run = canvas => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const camera = new Camera(Math.PI / 4, canvas.width, canvas.height, 0.1, 4000);
    camera.moveTo(0, 2, 40);
    camera.lookAt(0, 2, 0);
    const cameraController = new CameraController(camera);

    const physicsSystem = PhysicsSystem.getInstance();
    physicsSystem.setCollisionSystem(new CollisionSystemBrute());
    physicsSystem.setGravity(new Vector3(0, -9.8, 0));

    const ground = new JPlane(new Vector3(0, 1, 0));
    ground.setY(-10);
    ground.setMovable(false);
    ground.setFriction(0.5);
    physicsSystem.addBody(ground);

    const engine = new Engine(canvas);
    engine.backgroundColor = 0x339a66;
    engine.projection(45, canvas.width / canvas.height, 1.0, 1000.0);
    engine.worldUp(0, 1, 0);
    let world, car;

    window.addEventListener("mousemove", e => cameraController.mouseMove(e.clientX, e.clientY));
    window.addEventListener("mousedown", () => cameraController.mouseDown() || false);
    window.addEventListener("mouseup", () => cameraController.mouseUp() || false);
    window.addEventListener("keydown", e => handleKeyDown(e, cameraController, car));
    window.addEventListener("keyup", e => handleKeyUp(e, cameraController, car));

    const resourceLoader = new ResourceLoader();
    resourceLoader.add("chassis", "240z-chassis.obj");
    resourceLoader.add("wheel", "240z-wheel.obj");
    resourceLoader.add("crate", "crate.obj");
    resourceLoader.add("ball", "ball.obj");

    resourceLoader.load(resources => {
        const { carBody, scene } = buildScene(resources);
        world = scene;
        car = carBody;
        start(physicsSystem, cameraController, world, engine, camera);
    });
};

window.addEventListener("load", () => run(document.getElementById("demo")));
