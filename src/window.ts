const CANAVS_ID = "web-gpu-context";
const CANVAS_CONTEXT = "webgpu";

const createCanvas = (width: number, height: number, parent:HTMLElement=document.body ) : HTMLCanvasElement => {
    const canvas = document.createElement("canvas");
    parent.insertBefore(canvas, parent.firstChild);
    canvas.id = CANAVS_ID;
    canvas.width = width;
    canvas.height = height;

    return canvas;
}

const pixelRatio = () : number => {
    return window.devicePixelRatio || 1
}

export default class Window {
    private canvas: HTMLCanvasElement;

    constructor(container: HTMLElement, width: number = window.innerWidth, height: number = window.innerHeight) {
        this.canvas = createCanvas(width, height, container);
    }
    
    get width() {
        return this.canvas.width;
    }
    
    get height() {
        return this.canvas.height;
    }
    
    get context() : GPUCanvasContext {
        return this.canvas.getContext(CANVAS_CONTEXT) as unknown as GPUCanvasContext;
    }
    
    public resize = (width: number = window.innerWidth, height: number = window.innerHeight) : void => {
        this.canvas.width = width;
        this.canvas.height = height;
    }
    
    public hasResized = (width: number, height: number) : boolean => {
        if(this.width != width || this.height != height) return true;
        return false;
    }
}
