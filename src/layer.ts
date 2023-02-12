export default interface Layer {
    name: string;
    onInit: () => void;
    onUpdate: () => void;
    onDelete: () => void;
}