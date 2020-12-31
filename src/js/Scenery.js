import Core from "./core";
import JBox from "./physics/geometry/JBox";
import JSphere from "./physics/geometry/JSphere";
import Vector3 from "./physics/math/Vector3";
import JCar from "./physics/vehicles/Car";
import PhysicsCore from "./physics/physics/PhysicsSystem";


export default (resources) => {
    const chassis = resources["chassis"];
    const wheel = resources["wheel"];
    const crate = resources["crate"];
    const ball = resources["ball"];

    const ballFactory = Core.WavefrontParser("./", ball);
    ballFactory.useNormals(Core.NormalType.Triangle);
    const ballMesh = ballFactory.compile(true);

    const crateFactory = Core.WavefrontParser("./", crate);
    crateFactory.useNormals(Core.NormalType.Triangle);
    const crateMesh = crateFactory.compile(true);

    const planeMaterial = new Core.Material();
    const planeMesh = Core.Primitives.buildPlane(planeMaterial);
    Core.loadImage("green.png", img => planeMaterial.image = img);

    const Matrix = Core.Matrix44;
    const root = new Core.BranchNode().addChild(
        new Core.BranchNode(Matrix.createScale(50, 10, 50)).addChildren(
            [
                new Core.LeafNode(planeMesh, new Matrix().multiply(Matrix.createTranslation(0, -1, 0), Matrix.createScale(2, 2, 2))),
            ]
        ));

    const system = PhysicsCore.getInstance();

    for (let i = 0; i < 50; i++) {
        const rx = -20 + Math.random() * 40;
        const ry = -5 + Math.random() * 20;
        const rz = -20 + Math.random() * 40;
        let sz = 0.4 + Math.random() * 2;

        let geom = null;
        let mesh = null;
        if (Math.random() > 0.5) {
            geom = new JBox(sz * 2, sz * 2, sz * 2);
            mesh = crateMesh;//cubeMesh;
        } else {
            geom = new JSphere(sz);
            mesh = ballMesh;//sphereMesh;
        }

        geom.setFriction(0.5);
        geom.setMass(1);
        geom.moveTo(new Vector3(rx, ry, rz));
        system.addBody(geom);

        root.addChild(new Core.PhysicsNode(geom).addChild(new Core.LeafNode(mesh, Matrix.createScale(sz, sz, sz))));
    }

    const carbody = new JCar(null);
    const maxSteerAngle = 45;
    const steerRate = 5;
    const driveTorque = 500;

    carbody.setCar(maxSteerAngle, steerRate, driveTorque);

    const carx = 4.0;
    const cary = 0.25;
    const carz = 5.0;
    carbody.getChassis().setSideLengths(new Vector3(carx, cary, carz));
    carbody.getChassis().moveTo(new Vector3(0, -8.5, 0));
    carbody.getChassis().setMass(50);

    const wheelRadius = 1;
    const travel = 0.5;
    const sideFriction = 1.7;
    const fwdFriction = 1.7;
    const restingFrac = 0.5;
    const dampingFrac = 0.6;
    const rays = 8;

    carbody.setupWheel(JCar.WHEEL_FL, new Vector3(-1.5, -0.25, 2.35), sideFriction, fwdFriction, travel, wheelRadius, restingFrac, dampingFrac, rays);
    carbody.setupWheel(JCar.WHEEL_FR, new Vector3(1.5, -0.25, 2.35), sideFriction, fwdFriction, travel, wheelRadius, restingFrac, dampingFrac, rays);
    carbody.setupWheel(JCar.WHEEL_BL, new Vector3(-1.5, -0.25, -2.8), sideFriction, fwdFriction, travel, wheelRadius, restingFrac, dampingFrac, rays);
    carbody.setupWheel(JCar.WHEEL_BR, new Vector3(1.5, -0.25, -2.8), sideFriction, fwdFriction, travel, wheelRadius, restingFrac, dampingFrac, rays);

    let modelFactory = Core.WavefrontParser("./", chassis);
    modelFactory.useNormals(Core.NormalType.Triangle);
    const chassisMesh = modelFactory.compile(true);

    modelFactory = Core.WavefrontParser("./", wheel);
    modelFactory.useNormals(Core.NormalType.Triangle);
    const wheelMesh = modelFactory.compile(true);

    const scale = Matrix.createScale(9, 9, 9);
    const leftWheel = new Matrix().multiply(Matrix.createRotationAboutY(Math.PI), scale);
    const carUp = new Matrix().multiply(Matrix.createTranslation(0, 1, 0), scale);
    const car = new Core.BranchNode().addChildren(
        [
            new Core.LeafNode(chassisMesh, carUp),
            new Core.WheelPhysicsNode(carbody.getWheels()[JCar.WHEEL_FL]).addChild(new Core.LeafNode(wheelMesh, leftWheel)),
            new Core.WheelPhysicsNode(carbody.getWheels()[JCar.WHEEL_FR]).addChild(new Core.LeafNode(wheelMesh, scale)),
            new Core.WheelPhysicsNode(carbody.getWheels()[JCar.WHEEL_BL]).addChild(new Core.LeafNode(wheelMesh, leftWheel)),
            new Core.WheelPhysicsNode(carbody.getWheels()[JCar.WHEEL_BR]).addChild(new Core.LeafNode(wheelMesh, scale))
        ]
    );
    system.addBody(carbody.getChassis());
    root.addChild(new Core.PhysicsNode(carbody.getChassis()).addChild(car));

    return { carbody, scene: new Core.Scene(root) };
};
