import { mat4, vec3, vec4 } from 'gl-matrix';
import GameObject from './gameObject';
import { CheckGPU, createButton, createCanvas, createHeading } from './helper';
import Model from './models/model';
import { Camera, CameraController, FirstPersonCamera} from './renderer/camera';
import initRenderer, { addCamera, drawModel, getFrameRate, loadMesh} from './renderer/rend';

//Model Meshes
import CubeMesh from './meshes/cube';
import SquarePyramidMesh from './meshes/square_pyramid';
import PlaneMesh from './meshes/plane';

if (CheckGPU()) {
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

        return viewMatrix as Float32Array;
    }

    class MyCube implements Model {
        meshName: string = CubeMesh.meshName;
        transform: mat4 = mat4.create();
        startPos: vec3;

        constructor(startPos: vec3 = vec3.create()) {
            this.startPos = startPos;
            mat4.translate(this.transform, this.transform, startPos);
        }
        
        onInit = () => {
            console.log("Translating cube");
            // mat4.translate(this.transform, this.transform, this.startPos);
        };

        onUpdate = () => {
            // this.transform = getTransformationMatrix(this.startPos[0], this.startPos[1], this.startPos[2]);
        };

        onDestroy = () => {};
    }

    class MyPyramid implements Model {
        meshName: string = SquarePyramidMesh.meshName;
        transform: mat4;
        startPos: vec3;

        constructor(startPos: vec3 = vec3.create()) {
            this.startPos = startPos;
            this.transform = mat4.create();
            mat4.translate(this.transform, this.transform, this.startPos);
            console.log(this.transform);
        }

        onInit = () => {
            console.log("Translating cube");
            // mat4.translate(this.transform, this.transform, this.startPos);
        };

        onUpdate() {
            this.transform = getTransformationMatrix(this.startPos[0], this.startPos[1], this.startPos[2]);
        }

        onDestroy = () => {};
    }

    const frameCounter = createHeading(getFrameRate().toString());

    class Plane implements Model {
        meshName: string = PlaneMesh.meshName;
        transform: mat4;
        startPos: vec3;

        constructor(startPos: vec3 = vec3.create(), scale = vec3.create()) {
            this.startPos = startPos;
            this.transform = mat4.create();

            mat4.translate(this.transform, this.transform, this.startPos);
            mat4.scale(this.transform, this.transform, scale);
            console.log(this.transform);
        }

        onInit = () => {
        };

        onUpdate() {
            frameCounter.textContent = getFrameRate().toString();
        }

        onDestroy = () => {};
    }

    loadMesh(SquarePyramidMesh);
    loadMesh(CubeMesh);
    loadMesh(PlaneMesh);
    
    let i = 1;
    // drawModel(new MyCube(vec3.fromValues(0, 0, 0)));
    // drawModel(new MyPyramid(vec3.fromValues(1, 1, 4)));
    drawModel(new Plane(vec3.fromValues(0, 0, 0), vec3.fromValues(10, 1, 10)))

    createButton("Add Cube", () => {drawModel(new MyCube(vec3.fromValues(0, 1, i*4)));i++;});
    createButton("Add Pyramid", () => {drawModel(new MyPyramid(vec3.fromValues(2, 1, i*4)));i++;});

    let camera: Camera = new FirstPersonCamera (
        vec3.fromValues(0, 0, 5),
        vec3.create(),
        vec3.fromValues(0, 1, 0),
        aspect,
        1,
        1,
        100.00
    )

    addCamera(camera);

    initRenderer({canvas: canvas, pageState: {active: true}});

    
}