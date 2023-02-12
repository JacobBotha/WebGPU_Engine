import { mat4, vec3, vec4 } from 'gl-matrix';
import { CheckGPU, createCanvas } from './helper';
import Model from './models/model';
import initRenderer, { drawModel } from './renderer/rend';

if (CheckGPU()){
    console.log("Starting Bigworld...")

    const canvas = createCanvas();

    const aspect = canvas.width / canvas.height;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, (2 * Math.PI) / 5, aspect, 1, 100.0);

    function getTransformationMatrix(translatex = 0, translateY = 0, translateZ = 0) {
        const viewMatrix = mat4.create();
        mat4.translate(viewMatrix, viewMatrix, vec3.fromValues(translatex, translateY, translateZ));
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

    class MyCube implements Model {
        meshName: string = "cube";
        transform: mat4 = mat4.create();
        startPos: vec3;

        constructor(startPos: vec3 = vec3.create()) {
            this.startPos = startPos;
        }
        
        onUpdate() {
            this.transform = getTransformationMatrix(this.startPos[0], this.startPos[1], this.startPos[2]);
        }
    }

    class MyPyramid implements Model {
        meshName: string = "pyramid";
        transform: mat4 = mat4.create();
        startPos: vec3;

        constructor(startPos: vec3 = vec3.create()) {
            this.startPos = startPos;
        }

        onUpdate() {
            this.transform = getTransformationMatrix(this.startPos[0], this.startPos[1], this.startPos[2]);
        }
    }

    for (let i = 1; i <= 20; i++) {
        drawModel(new MyCube(vec3.fromValues(-2, -1, i*-4)));
        drawModel(new MyPyramid(vec3.fromValues(2, -1, i*-4)));
    }
    
    // drawModel(new MyCube());
    // drawModel(new MyPyramid());

    initRenderer({canvas: canvas, pageState: {active: true}});
}
// main();