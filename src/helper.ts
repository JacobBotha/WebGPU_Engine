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

export const createTextInput = (text: string, label: string, parent:HTMLElement=document.body) : HTMLButtonElement => {
    const labelEl = document.createElement("p");
    labelEl.textContent = label;
    parent.appendChild(labelEl);
    const input = document.createElement("input");
    input.onclick = onclick;
    input.textContent = text;
    parent.appendChild(input);

    return input;
}

export type radioOption = {
    name: string,
    isCorrect: boolean
}

export const createRadioGroup = (text: string, options: radioOption[], parent:HTMLElement=document.body) : HTMLDivElement => {
    const container = document.createElement('div');
    const heading = createHeading(text, container);
    const form = document.createElement('form');
    options.forEach(({ name, isCorrect }) => form.appendChild(createOptionRadio(name, isCorrect)));
    container.appendChild(form);
    parent.appendChild(container);

    return container;
}

const createOptionRadio = (name: string, isCorrect, parent:HTMLElement=document.body) => {
    const container = document.createElement('div');

    const input = document.createElement('input');
    input.type = 'radio';
    input.value = name;
    input.id = name;
    input.checked = isCorrect;
    input.name = 'question-option';

    const label = document.createElement('label');
    label.htmlFor = name;
    label.textContent = name[0].toUpperCase() + name.slice(1);

    container.appendChild(input);
    container.appendChild(label);

    return container;
};

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
