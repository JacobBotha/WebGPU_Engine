export const CheckGPU = () : boolean => {
    const entry: GPU = navigator.gpu;
    const gpuCheck = document.getElementById('gpu-check') as HTMLHeadingElement;

    if (!entry) {
        gpuCheck.textContent = 'Current browser does not support WebGPU!';
        return false;
    }

    gpuCheck.textContent = 'WebGPU Enabled!';

    return true;
}

export const createCanvas = () : HTMLCanvasElement => {
    const canvas = document.createElement("canvas");
    const gpuCheck = document.getElementById('checker-div');
    document.body.insertBefore(canvas, gpuCheck);
    canvas.id = "web-gpu-context";
    canvas.width = 640;
    canvas.height = 480;

    gpuCheck?.remove();

    return canvas;
}

export enum BWResult {
    SUCESS,
    ERROR
}