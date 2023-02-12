import CubeMesh from '../meshes/cube';

import basicVertWGSL from './shaders/basic.vert.wgsl';
import vertexPositionColorWGSL from './shaders/vertexPositionColor.frag.wgsl';
import { mat4, vec3 } from 'gl-matrix';
import Mesh, { MeshMap } from '../meshes/mesh';
import Model from '../models/model';
import { BWResult } from '../helper';
import SquarePyramidMesh from '../meshes/square_pyramid';

export type RenderInit = (params: {
    canvas: HTMLCanvasElement;
    pageState: { active: boolean};
}) => void | Promise<void>;

//Should be moved out of rend.
// const cube = CubeMesh;
const sqPyramid = SquarePyramidMesh;

//Map for storing all active meshes used in the scene.
const meshMap = new MeshMap();

const models: Model[] = [];
//The list of bind groups
const uniformBindGroups: GPUBindGroup[] = [];

/**
 * Draw a model to the screen with the model's given transform. The mesh of
 * the model will need to have been loaded already and will return ERROR 
 * BWResult if not. Should most likely be moved to a scene module.
 * 
 * @param model Model to be drawn.
 * @return BWResult
 */
export const drawModel = (model: Model) : BWResult => {
    // meshMap.add()
    models.push(model);
    //Architecture redisgn to allow for dynamic model uploads
    // uniformBindGroups.push();
    return BWResult.SUCESS;
};

/**
 * Loads the mesh to be stored on the GPU. If map is already loaded return 
 * ERROR result.
 *  
 * @param mesh Mesh to be loaded to the GPU
 * @returns BWResult
 */
export const loadMesh = (mesh: Mesh) : BWResult => {
    try {
        meshMap.add(mesh);
        return BWResult.SUCESS;
    } catch (err) {
        console.log(err);
        return BWResult.ERROR;
    };
};


console.log(loadMesh(CubeMesh));
loadMesh(sqPyramid);

const matrixSize = 4 * 16

/**
 * Create a new bind group for the specified uniform buffer and accounts for
 * the size of a matrix.
 * 
 * @param device GPUDevice to be used to create the bind group
 * @param pipeline GPUPipeline to create the bind group from
 * @param uniformBuffer GPUBuffer to assign the bindgroup to
 * @param offset number of 4x4 matrices from the start of the buffer
 */
const newUniformBindGroup = (
    device: GPUDevice, pipeline: 
    GPURenderPipeline, 
    uniformBuffer: GPUBuffer,
    offset: number,
) : GPUBindGroup => {
    return device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
        {
            binding: 0,
            resource: {
                buffer: uniformBuffer,
                offset: offset*256,
                size: matrixSize
            },
        },
        ],
    });
}

/**
 * Begins the renderer including the draw loop. If renderer could not be
 * initialised an error is thrown.
 * 
 * @param param0 Dictionary containing canvas and pagestate information.
 */
const initRenderer: RenderInit = async ({canvas, pageState}) => {
    /**
     * Select the GPU adaptor to use for rendering. If forceFallback is true
     * AND blockFallback is true then no adaptor can be selected.
     * 
     * @param entry The WebGPU entry
     * @param powerPreference GPUPowerPreference for the adaptor
     * @param forceFallback boolean Force GPU to be a fallback adaptor
     * @param blockFallback boolean Block the fallback adaptor from being used
     * @returns Promise<GPUAdapter | null>
     */
    async function selectAdapter(
        entry: GPU, 
        powerPreference?: GPUPowerPreference, 
        forceFallback = false, 
        blockFallback = false
    ) {
        const adapter = await entry.requestAdapter({
            powerPreference: powerPreference, 
            forceFallbackAdapter: forceFallback
        });

        if (adapter?.isFallbackAdapter && blockFallback === true) 
            return null;

        return adapter;
    }

    const adapter = await selectAdapter(navigator.gpu, 'high-performance', false, true);
    //debug
    const adapterInfo = await adapter?.requestAdapterInfo();
    console.log(adapterInfo?.vendor);
    console.log(adapter?.isFallbackAdapter);
    
    //temp
    if (adapter == null) {
        throw new Error("Could not find adapter")
    }
    const device = await adapter.requestDevice();

    if (!pageState.active) return;
    const context = canvas.getContext('webgpu') as unknown as GPUCanvasContext;

    const devicePixelRatio = window.devicePixelRatio || 1;
    const presentationSize = [
        canvas.clientWidth * devicePixelRatio,
        canvas.clientHeight * devicePixelRatio,
    ];
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

    context.configure({
        device,
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
        format: presentationFormat,
        alphaMode: 'opaque',
    });

    // Create a vertex buffer from the MeshMap
    const verticesBuffer = device.createBuffer({
        size: meshMap.vertexSize * meshMap.vertexCount,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true,
    });

    //Add all vertices in array
    let bufferArray = new Float32Array(verticesBuffer.getMappedRange())
    meshMap.forEach(({mesh, offset}) => {
        bufferArray.set(mesh.vertexArray, (meshMap.vertexSize/4) * offset);
    });
    verticesBuffer.unmap();

    //Create a new pipeline for each MeshMap/Shader
    const pipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
            module: device.createShaderModule({
                code: basicVertWGSL,
            }),
            entryPoint: 'main',
            buffers: [
                {
                arrayStride: meshMap.vertexSize,
                attributes: [
                    {
                    // position
                    shaderLocation: 0,
                    offset: meshMap.positionOffset,
                    format: 'float32x4',
                    },
                    {
                    // uv
                    shaderLocation: 1,
                    offset: meshMap.uvOffset,
                    format: 'float32x2',
                    },
                ],
                },
            ],
        },
        fragment: {
            module: device.createShaderModule({
                code: vertexPositionColorWGSL,
            }),
            entryPoint: 'main',
            targets: [
                {
                format: presentationFormat,
                },
            ],
        },
        primitive: {
            topology: 'triangle-list',

            // Backface culling since the cube is solid piece of geometry.
            // Faces pointing away from the camera will be occluded by faces
            // pointing toward the camera.
            cullMode: 'back',
        },

            // Enable depth testing so that the fragment closest to the camera
            // is rendered in front.
            depthStencil: {
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth24plus',
        },
    });

    const depthTexture = device.createTexture({
        size: presentationSize,
        format: 'depth24plus',
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    //Size of buffer changes with number of models
    const uniformBufferSize = 256 * models.length; // 4x4 matrix
    const uniformBuffer = device.createBuffer({
        size: uniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    for (let i = 0; i < models.length; i++) {
        uniformBindGroups.push(newUniformBindGroup(device, pipeline, uniformBuffer, i));
    }

    const renderPassDescriptor: GPURenderPassDescriptor = {
        colorAttachments: [
        {
            view: undefined,
            resolveTarget: undefined,
            clearValue: { r: 0.5, g: 0.5, b: 0.5, a: 1.0 },
            loadOp: 'clear',
            storeOp: 'store',
        } as unknown as GPURenderPassColorAttachment,
        ],
        depthStencilAttachment: {
        view: depthTexture.createView(),

        depthClearValue: 1.0,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
        },
    };

    const aspect = canvas.width / canvas.height;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, (2 * Math.PI) / 5, aspect, 1, 100.0);

    function frame() {
        // Sample is no longer the active page.
        if (!pageState.active) return;

        // const transformationMatrix = getTransformationMatrix(2);
        // device.queue.writeBuffer(
        //     uniformBuffer,
        //     0,
        //     transformationMatrix.buffer,
        //     transformationMatrix.byteOffset,
        //     transformationMatrix.byteLength
        // );
        // const transformationMatrix2 = getTransformationMatrix(-2);
        
        //Update each model in the model list
        for (let model of models) {
            model.onUpdate();
        }
        
        //Write uniform data to GPU
        for (let i = 0; i < models.length; i++) {
            const matrix = models[i].transform as Float32Array;
            const offset = 256 * i;
            // console.log("Offset: " + offset + "\n Name:" + models[i].meshName + "\n Matrix: " + matrix);
            device.queue.writeBuffer(
                uniformBuffer,
                offset,
                matrix.buffer,
                matrix.byteOffset,
                matrix.byteLength
            );
            
        }
        (renderPassDescriptor.colorAttachments as Array<GPURenderPassColorAttachment>)[0].view = context
        .getCurrentTexture()
        .createView();

        const commandEncoder = device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(pipeline);
        passEncoder.setVertexBuffer(0, verticesBuffer);
        // passEncoder.draw(cube.vertexCount, 1, 0, 0);

        //Draw each mesh in the map. - Should be changed to draw each mesh for the models.
        for (let i = 0; i < models.length; i++) {
            const {mesh, offset} = meshMap.get(models[i].meshName);
            passEncoder.setBindGroup(0, uniformBindGroups[i]);
            passEncoder.draw(mesh.vertexCount, 1, offset, 0);
        }

        passEncoder.end();
        device.queue.submit([commandEncoder.finish()]);

        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
};

export default initRenderer;