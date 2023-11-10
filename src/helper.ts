export const CheckGPU = () : boolean => {
    const entry: GPU = navigator.gpu;
    const gpuCheck = document.getElementById('gpu-check') as HTMLHeadingElement;

    if (!entry) {
        gpuCheck.textContent = 'Current browser does not support WebGPU!';
        return false;
    }

    gpuCheck.textContent = 'WebGPU Enabled! Ready to start your adventure?';

    return true;
}

export const createPageButton = (text: string, onclick?: () => void, parent:HTMLElement=document.body) => {
    const button = createButton(text, onclick, parent);
    button.classList.add("page-button");

    return button
}

export const createGameButton = (text: string, onclick?: () => void, parent:HTMLElement=document.body) => {
    const button = createButton(text, onclick, parent);
    button.classList.add("game-button");

    return button
}

const createButton = (text: string, onclick?: () => void, parent:HTMLElement=document.body) : HTMLButtonElement => {
    const button = document.createElement("button");
    button.onclick = onclick;
    button.textContent = text;
    parent.appendChild(button);

    return button;
}

export const createHeading = (text: string, parent: HTMLElement=document.body) : HTMLHeadingElement => {
    const heading = document.createElement("h5");
    heading.textContent =  text;
    parent.appendChild(heading);

    return heading;
}

export enum BWResult {
    SUCESS,
    ERROR
}
