import Matrix44 from "./Matrix44";
import BranchNode from "./BranchNode";

export default function(rigidBody) {
    const base = new BranchNode();
    const matrix = new Matrix44().identity();

    base.update = function() {
        const currentState = rigidBody.getCurrState();
        const pos = currentState.position;
        const dir = currentState.orientation._rawData;
        matrix.data[0] = dir[0];
        matrix.data[4] = dir[1];
        matrix.data[8] = dir[2];
        matrix.data[12] = pos.x;
        matrix.data[1] = dir[4];
        matrix.data[5] = dir[5];
        matrix.data[9] = dir[6];
        matrix.data[13] = pos.y;
        matrix.data[2] = dir[8];
        matrix.data[6] = dir[9];
        matrix.data[10] = dir[10];
        matrix.data[14] = pos.z;
        base.setLocalTransform(matrix);
    };
    return base;
};

