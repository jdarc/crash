import Matrix4 from "../math/Matrix4";
import Node from "../core/Node";

export default function(rigidBody) {
    const base = new Node();
    const matrix = new Matrix4();

    base.update = function() {
        const currentState = rigidBody.getCurrState();
        matrix.data[0] = currentState.orientation.data[0];
        matrix.data[1] = currentState.orientation.data[4];
        matrix.data[2] = currentState.orientation.data[8];
        matrix.data[4] = currentState.orientation.data[1];
        matrix.data[5] = currentState.orientation.data[5];
        matrix.data[6] = currentState.orientation.data[9];
        matrix.data[8] = currentState.orientation.data[2];
        matrix.data[9] = currentState.orientation.data[6];
        matrix.data[10] = currentState.orientation.data[10];
        matrix.data[13] = currentState.position.y;
        matrix.data[12] = currentState.position.x;
        matrix.data[14] = currentState.position.z;
        base.setLocalTransform(matrix);
    };
    return base;
};

