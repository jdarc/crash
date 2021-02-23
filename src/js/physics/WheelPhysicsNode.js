import Matrix4 from "../math/Matrix4";
import Node from "../core/Node";

export default function(wheel) {
    const base = new Node();

    base.update = function() {
        const pos = wheel.getActualPos();
        const san = wheel.getSteerAngle() * Math.PI / 180;
        const aan = wheel.getAxisAngle() * Math.PI / 180;
        const moveTo = Matrix4.createTranslation(pos.x, pos.y, pos.z);
        const steerRot = Matrix4.createRotationAboutY(san);
        const axisRot = Matrix4.createRotationAboutX(aan);
        base.setLocalTransform(moveTo.multiply(moveTo, steerRot.multiply(steerRot, axisRot)));
    };

    return base;
};
