import { mat4, vec3, vec4 } from 'gl-matrix';
import GameObject from './gameObject';
import { CheckGPU, createPageButton, createGameButton, createHeading } from './helper';
import Model from './models/model';
import { Camera, CameraController, FirstPersonCamera} from './renderer/camera';
import initRenderer, { addCamera, drawModel, getFrameRate, loadMesh} from './renderer/rend';
import Window from './window';

//Model Meshes
import CubeMesh from './meshes/cube';
import SquarePyramidMesh from './meshes/square_pyramid';
import PlaneMesh from './meshes/plane';

const gameContainer = document.getElementById("canvas-wrap");
const overlay = document.getElementById("canvas-overlay");

const initContainer = () : Window => {
    let gameWindow = new Window(gameContainer)

    overlay.style.height = gameWindow.height.toString() + "px";
    overlay.style.width = gameWindow.width.toString() + "px";
    
    return gameWindow;
}

const run = (aspect: number) : void => {
    // const aspect = gameWindow.width / gameWindow.height;
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


    // createGameButton("Add Cube", () => {drawModel(new MyCube(vec3.fromValues(0, 1, i*4)));i++;}, overlay);
    // createGameButton("Add Pyramid", () => {drawModel(new MyPyramid(vec3.fromValues(2, 1, i*4)));i++;}, overlay);
    let i=1;
    while (i <= 40) {
        let j=1;
        while (j <= 40) {
            let k=1;
            while (k <= 40){
                drawModel(new MyPyramid(vec3.fromValues(k*4, j*4, i*4)));
                k++
            }
            j++;
        }
        i++;
    }
    const frameCounter = createHeading(getFrameRate().toString(), overlay);

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
    
    // drawModel(new MyCube(vec3.fromValues(0, 0, 0)));
    // drawModel(new MyPyramid(vec3.fromValues(1, 1, 4)));
    drawModel(new Plane(vec3.fromValues(0, 0, 0), vec3.fromValues(10, 1, 10)))

    let camera: Camera = new FirstPersonCamera (
        vec3.fromValues(0, 0, 5),
        vec3.create(),
        vec3.fromValues(0, 1, 0),
        aspect,
        1,
        0.1,
        1000.00
    )

    addCamera(camera);
    
}


const preGameDiv = document.getElementById('checker-div');

const startGame = () : void => {
    if (!CheckGPU()) {
        return;
    }
    console.log("Starting Bigworld...")
    
    preGameDiv?.remove();
    let gameWindow = initContainer();
    const onResize = (event: Event) => { 
        console.log("Resize");
        gameWindow.resize();

        overlay.style.height = gameWindow.height.toString() + "px";
        overlay.style.width = gameWindow.width.toString() + "px";
    }

    window.addEventListener("resize", onResize);

    run(gameWindow.width/gameWindow.height);
    // create event handler for resize
    initRenderer({gameWindow: gameWindow, pageState: {active: true}});
}

//Create play button and initial elements
let title = createHeading('Welcome to BigWorld. Start your adventure now!', preGameDiv);
let playBttn = createPageButton('Play Now!', startGame, preGameDiv);
