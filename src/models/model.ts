import { mat4 } from "gl-matrix";

export default interface Model {
    readonly meshName: string;
    readonly transform: mat4;    
    //Possible add in the transformations (might be better as abstract class?)

    onUpdate: () => void;
}