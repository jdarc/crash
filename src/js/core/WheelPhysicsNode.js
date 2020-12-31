import Matrix44 from "./Matrix44";
import BranchNode from "./BranchNode";

export default function(wheel) {
    const base = new BranchNode();

    base.update = function() {
        const pos = wheel.getActualPos();
        const san = wheel.getSteerAngle() * Math.PI / 180;
        const aan = wheel.getAxisAngle() * Math.PI / 180;
        const moveTo = Matrix44.createTranslation(pos.x, pos.y, pos.z);
        const steerRot = Matrix44.createRotationAboutY(san);
        const axisRot = Matrix44.createRotationAboutX(aan);
        base.setLocalTransform(moveTo.multiply(moveTo, steerRot.multiply(steerRot, axisRot)));
    };

    return base;
};
