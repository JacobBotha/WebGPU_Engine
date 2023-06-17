import GameObject from "../gameObject";

export default interface Model extends GameObject{
    readonly meshName: string;
    // readonly transform: mat4;    
    // //Possible add in the transformations (might be better as abstract class?)

    // onUpdate: () => void;
}