import { mat4, vec3 } from 'gl-matrix';
import { CheckGPU, createCanvas } from './helper';
import Model from './models/model';
import initRenderer, { drawModel } from './renderer/rend';

if (CheckGPU()){
    console.log("Starting Bigworld...")

    const canvas = createCanvas();

    const aspect = canvas.width / canvas.height;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, (2 * Math.PI) / 5, aspect, 1, 100.0);

    function getTransformationMatrix(translatex = 0) {
        const viewMatrix = mat4.create();
        mat4.translate(viewMatrix, viewMatrix, vec3.fromValues(translatex, 0, -4));
        const now = Date.now() / 1000;
        mat4.rotate(
        viewMatrix,
        viewMatrix,
        1,
        vec3.fromValues(Math.sin(now), Math.cos(now), 0)
        );

        const modelViewProjectionMatrix = mat4.create();
        mat4.multiply(modelViewProjectionMatrix, projectionMatrix, viewMatrix);

        return modelViewProjectionMatrix as Float32Array;
    }
    
    let sqTransform = mat4.create();
    let pyTransform = mat4.create();

    class MyCube implements Model {
        meshName: string = "cube";
        transform: mat4 = mat4.create();
        onUpdate() {
            this.transform = getTransformationMatrix(-2);
        }
    }

    class MyPyramid implements Model {
        meshName: string = "pyramid";
        transform: mat4 = mat4.create();
        onUpdate() {
            this.transform = getTransformationMatrix(2);
        }
    }

    drawModel(new MyCube());
    drawModel(new MyPyramid());

    initRenderer({canvas: canvas, pageState: {active: true}});
}
// main();