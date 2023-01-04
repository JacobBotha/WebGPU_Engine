import { CheckGPU, createCanvas } from './helper';
import initRenderer from './renderer/rend';

if (CheckGPU()){
    console.log("Starting Bigworld...")

    const canvas = createCanvas();

    initRenderer({canvas: canvas, pageState: {active: true}});
}
// main();