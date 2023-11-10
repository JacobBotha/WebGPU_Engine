import { mat4, vec3 } from "gl-matrix";
import GameObject from "../gameObject";
import { getDeltaTime } from "./rend";

export abstract class Camera implements GameObject{
    position: vec3;
    direction: vec3;
    up: vec3;
    aspect: number;
    fovy: number;
    znear: number;
    zfar: number;

    constructor (position: vec3, direction: vec3, up: vec3, aspect: number, fovy: number = 1, znear: number = 1, zfar: number = 100) {
        this.position = position
        this.direction = direction;
        this.up = up;
        this.aspect = aspect;
        this.fovy = fovy;
        this.znear = znear;
        this.zfar = zfar;
    }
    abstract transform: mat4;
    abstract onInit: () => void;
    abstract onUpdate: () => void;
    abstract onDestroy: () => void;

    abstract viewMatrix();

    abstract projMatrix();
}

export class FirstPersonCamera extends Camera implements GameObject {
    transform: mat4 = mat4.create();
    mouseSpeed = 0.5;
    speed = 10.00; //3 units per second

    private horizontalAngle = 3.14;
    private verticalAngle = 0;
    private forward: boolean = false;
    private backward: boolean = false;
    private left: boolean = false;
    private right: boolean = false;
    private rightDirection: vec3 = vec3.create();
    private initialFov = 45;

    private rotate = false;
    private lastX = 0;
    private lastY = 0;

    onInit: () => void = () => {
        document.addEventListener('mousedown', (event) => {
            this.rotate = true;
            this.lastX = event.clientX;
            this.lastY = event.clientY;
        });

        document.addEventListener('mouseup', () => {this.rotate = false});

        document.addEventListener('mousemove', (event) => {
            if (!this.rotate) return;

            var newX = event.clientX;
            var newY = event.clientY;

            this.horizontalAngle += this.mouseSpeed * getDeltaTime() * (this.lastX - event.clientX );
            this.verticalAngle   += this.mouseSpeed * getDeltaTime() * (this.lastY - event.clientY );        

            console.log(event.clientX);

            this.direction = vec3.fromValues(
                Math.cos(this.verticalAngle) * Math.sin(this.horizontalAngle),
                Math.sin(this.verticalAngle),
                Math.cos(this.verticalAngle) * Math.cos(this.horizontalAngle)
            );

            this.rightDirection = vec3.fromValues(
                Math.sin(this.horizontalAngle - 3.14/2.0),
                0,
                Math.cos(this.horizontalAngle - 3.14/2.0)
            );

            vec3.cross(this.up, this.rightDirection, this.direction);

            this.lastX = newX
            this.lastY = newY;
        });

        document.addEventListener('wheel', (event) => {
            this.fovy = this.initialFov - 5 * event.deltaY;
        });

        document.addEventListener('keydown', (event) => {
            if (event.key == "w") this.forward= true;
            if (event.key == "s") this.backward = true;
            if (event.key == "a") this.left = true;
            if (event.key == "d") this.right = true;
        });

        document.addEventListener('keyup', (event) => {
            if (event.key == "w") this.forward = false;
            if (event.key == "s") this.backward = false;
            if (event.key == "a") this.left = false;
            if (event.key == "d") this.right = false;
        });
    };

    onUpdate: () => void = () => {
        if (this.forward){
            let timeAdjDir = vec3.create();
            vec3.scale(timeAdjDir, this.direction, getDeltaTime()*this.speed);
            vec3.add(this.position, this.position, timeAdjDir);
            console.log("Moving Forward!")
        }

        if (this.backward){
            let timeAdjDir = vec3.create();
            vec3.scale(timeAdjDir, this.direction, getDeltaTime()*this.speed);
            vec3.subtract(this.position, this.position, timeAdjDir);
            console.log("Moving Backward!")
        }

        if (this.right){
            let timeAdjDir = vec3.create();
            vec3.scale(timeAdjDir, this.rightDirection, getDeltaTime()*this.speed);
            vec3.add(this.position, this.position, timeAdjDir);
            console.log("Moving Right!")
        }

        if (this.left){
            let timeAdjDir = vec3.create();
            vec3.scale(timeAdjDir, this.rightDirection, getDeltaTime()*this.speed);
            vec3.subtract(this.position, this.position, timeAdjDir);
            console.log("Moving Left!")
        }
    };
    onDestroy: () => void;

    viewMatrix() : mat4 {
        let view: mat4 = mat4.create();
        let target: vec3 = vec3.create();
        vec3.add(target, this.position, this.direction);
        mat4.lookAt(view, this.position, target, this.up);
        return view;
    }

    projMatrix(): mat4 {
        const projectionMatrix = mat4.create();
        // mat4.perspective(projectionMatrix, this.fovy * (Math.PI/180), this.aspect, this.znear, this.zfar);
        mat4.perspective(projectionMatrix, (Math.PI * 2) / 5, this.aspect, this.znear, this.zfar);

        return projectionMatrix;
    }

}

export class CameraController implements GameObject{
    transform: mat4;

    camera: Camera;

    speed: number;
    forward: boolean = false;
    backward: boolean = false;
    left: boolean = false;
    right: boolean = false;

    constructor(camera: Camera, speed: number = 0.05) {
        this.transform = mat4.create();        
        this.camera = camera;
        this.speed = speed;

        document.addEventListener('keydown', (event) => {
            if (event.key == "w") this.forward= true;
            if (event.key == "s") this.backward = true;
            if (event.key == "a") this.left = true;
            if (event.key == "d") this.right = true;
        });

        document.addEventListener('keyup', (event) => {
            if (event.key == "w") {
                this.forward = false;
                console.log("keyup");
            }
            if (event.key == "s") this.backward = false;
            if (event.key == "a") this.left = false;
            if (event.key == "d") this.right = false;
        });

        // buildViewProjMat(this.transform, this.camera);
    }

    onInit: () => void;
    onUpdate = () => {
    };
    onDestroy: () => void;

}
