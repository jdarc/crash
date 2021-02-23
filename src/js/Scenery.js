import Vector3 from "./math/Vector3";
import Matrix4 from "./math/Matrix4";

import WavefrontParser from "./core/WavefrontParser";
import { loadImage } from "./core/ResourceLoader";
import ModelFactory from "./core/ModelFactory";
import NormalType from "./core/NormalType";
import Material from "./core/Material";

import WheelPhysicsNode from "./physics/WheelPhysicsNode";
import PhysicsNode from "./physics/PhysicsNode";
import Node from "./core/Node";
import Scene from "./core/Scene";

import Physics from "./physics/physics/PhysicsSystem";
import JSphere from "./physics/geometry/JSphere";
import JBox from "./physics/geometry/JBox";
import JCar from "./physics/vehicles/Car";

const buildPlane = (material, size = 1) => {
    const model = new ModelFactory();

    model.addVertex(-size, 0, size);
    model.addVertex(size, 0, size);
    model.addVertex(size, 0, -size);
    model.addVertex(-size, 0, -size);

    model.addNormal(0, 1, 0);

    model.addUvCoordinate(0, 0);
    model.addUvCoordinate(size, 0);
    model.addUvCoordinate(size, size);
    model.addUvCoordinate(0, size);

    model.createTriangle(0, 1, 2).normals(0, 0, 0).texelCoordinates(0, 1, 2);
    model.createTriangle(2, 3, 0).normals(0, 0, 0).texelCoordinates(2, 3, 0);

    model.changeMaterial(material);
    return model.compile(false);
};

const buildMesh = (resources) => {
    const result = {};
    for (const thing in resources) {
        const modelFactory = WavefrontParser(resources[thing]);
        modelFactory.useNormals(NormalType.Triangle);
        result[`${thing}Mesh`] = modelFactory.compile(true);
    }
    return result;
}

export default resources => {
    const meshes = buildMesh(resources);

    const chassisMesh = meshes["chassisMesh"];
    const wheelMesh = meshes["wheelMesh"];
    const ballMesh = meshes["ballMesh"];
    const crateMesh = meshes["crateMesh"];

    const planeMaterial = new Material();
    const planeMesh = buildPlane(planeMaterial, 4);
    loadImage("data/green.png", img => planeMaterial.image = img);

    const root = new Node().addChild(
        new Node(Matrix4.createScale(50, 10, 50)).addChild(new Node(Matrix4.createTranslation(0, -1, 0), planeMesh)));

    const system = Physics.getInstance();

    for (let i = 0; i < 100; i++) {
        const rx = -20 + Math.random() * 40;
        const ry = 20 + Math.random() * 40;
        const rz = -20 + Math.random() * 40;
        const sz = 0.4 + Math.random() * 2;

        let geom = null;
        let mesh = null;
        if (Math.random() > 0.5) {
            geom = new JBox(sz * 2, sz * 2, sz * 2);
            mesh = crateMesh;
        } else {
            geom = new JSphere(sz);
            mesh = ballMesh;
        }

        geom.setFriction(0.5);
        geom.setMass(1);
        geom.moveTo(new Vector3(rx, ry, rz));
        system.addBody(geom);

        root.addChild(new PhysicsNode(geom).addChild(new Node(Matrix4.createScale(sz, sz, sz), mesh)));
    }

    const carBody = new JCar(null);
    const maxSteerAngle = 45;
    const steerRate = 5;
    const driveTorque = 500;

    carBody.setCar(maxSteerAngle, steerRate, driveTorque);

    const carx = 4.0;
    const cary = 0.25;
    const carz = 5.0;
    carBody.getChassis().setSideLengths(new Vector3(carx, cary, carz));
    carBody.getChassis().moveTo(new Vector3(0, -8.5, 0));
    carBody.getChassis().setMass(50);

    const wheelRadius = 1;
    const travel = 0.5;
    const sideFriction = 1.7;
    const fwdFriction = 1.7;
    const restingFrac = 0.5;
    const dampingFrac = 0.6;
    const rays = 8;

    carBody.setupWheel(JCar.WHEEL_FL, new Vector3(-1.5, -0.25, 2.35), sideFriction, fwdFriction, travel, wheelRadius, restingFrac, dampingFrac, rays);
    carBody.setupWheel(JCar.WHEEL_FR, new Vector3(1.5, -0.25, 2.35), sideFriction, fwdFriction, travel, wheelRadius, restingFrac, dampingFrac, rays);
    carBody.setupWheel(JCar.WHEEL_BL, new Vector3(-1.5, -0.25, -2.8), sideFriction, fwdFriction, travel, wheelRadius, restingFrac, dampingFrac, rays);
    carBody.setupWheel(JCar.WHEEL_BR, new Vector3(1.5, -0.25, -2.8), sideFriction, fwdFriction, travel, wheelRadius, restingFrac, dampingFrac, rays);

    const scale = Matrix4.createScale(9, 9, 9);
    const leftWheel = new Matrix4().multiply(Matrix4.createRotationAboutY(Math.PI), scale);
    const carUp = new Matrix4().multiply(Matrix4.createTranslation(0, 1, 0), scale);
    const car = new Node().addChildren(
        [
            new Node(carUp, chassisMesh),
            new WheelPhysicsNode(carBody.getWheels()[JCar.WHEEL_FL]).addChild(new Node(leftWheel, wheelMesh)),
            new WheelPhysicsNode(carBody.getWheels()[JCar.WHEEL_FR]).addChild(new Node(scale, wheelMesh)),
            new WheelPhysicsNode(carBody.getWheels()[JCar.WHEEL_BL]).addChild(new Node(leftWheel, wheelMesh)),
            new WheelPhysicsNode(carBody.getWheels()[JCar.WHEEL_BR]).addChild(new Node(scale, wheelMesh))
        ]
    );
    system.addBody(carBody.getChassis());
    root.addChild(new PhysicsNode(carBody.getChassis()).addChild(car));

    return { carBody, scene: new Scene(root) };
};
