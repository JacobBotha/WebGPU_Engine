import { mat4 } from "gl-matrix";

export default interface GameObject {
    transform: mat4;

    onInit: () => void;
    onUpdate: () => void;
    onDestroy: () => void;
}