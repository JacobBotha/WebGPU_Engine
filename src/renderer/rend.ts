import basicVertWGSL from './shaders/basic.vert.wgsl';
import vertexPositionColorWGSL from './shaders/vertexPositionColor.frag.wgsl';
import { mat4, vec3 } from 'gl-matrix';
import Mesh, { MeshMap } from '../meshes/mesh';
import Model from '../models/model';
import { BWResult } from '../helper';
import GameObject from '../gameObject';
import { SourceMap } from 'module';
import { resourceLimits } from 'worker_threads';
import { Camera } from './camera';
import Window from '../window'

export type RenderInit = (params: {
    gameWindow: Window;
    pageState: { active: boolean};
}) => void | Promise<void>;

//Map for storing all active meshes used in the scene.
const meshMap = new MeshMap();

const maxModels = 100;
const models: Model[] = [];
//The list of bind groups
const uniformBindGroups: GPUBindGroup[] = [];

//Future - Use array order as priorty of camera
const maxCameras = 1;
const cameras: Camera[] = [];
const cameraUniformBindGroups: GPUBindGroup[] = [];

export const addCamera = (camera: Camera) : BWResult => {
    if (cameras.length >= maxCameras)
        return BWResult.ERROR;

    camera.onInit();
    cameras.push(camera);
    return BWResult.SUCESS;
}

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
    if (models.length == maxModels) {
        console.log("Cannot add model exceeded max!")
        return BWResult.ERROR;
    }

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
    device: GPUDevice, 
    pipeline: GPURenderPipeline, 
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

let deltaTime = 0;
let frameNo = 0;

export const getDeltaTime = () => {
    return deltaTime/1000;
}

const startTime = Date.now();

export const getFrameRate = () => {
    return frameNo/((Date.now() - startTime) / 1000);
}

/**
 * Begins the renderer including the draw loop. If renderer could not be
 * initialised an error is thrown.
 * 
 * @param param0 Dictionary containing gameWindow and pagestate information.
 */
const initRenderer: RenderInit = async ({gameWindow, pageState}) => {
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
    const context = gameWindow.context;

    const presentationSize = [
        gameWindow.width, 
        gameWindow.height, 
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

    let depthTexture = device.createTexture({
        size: presentationSize,
        format: 'depth24plus',
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    //Size of buffer changes with number of models
    // const uniformBufferSize = 256 * models.length; // 4x4 matrix

    //Start with fixed size uniform buffer (Max 100 objects) 
    //TODO: Dynamic UBO size increase/new buffer?
    const uniformBufferSize = 256 * maxModels; // 4x4 matrix

    const uniformBuffer = device.createBuffer({
        size: uniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    for (let i = 0; i < maxModels; i++) {
        uniformBindGroups.push(newUniformBindGroup(device, pipeline, uniformBuffer, i));
    }

    const cameraUniformBufferSize = 256 * maxCameras; // 4x4 matrix

    const cameraUniformBuffer = device.createBuffer({
        size: cameraUniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    //Maybe unecessary and use same function as regular uniform buffer.
    function createCameraBindGroup () {
        return device.createBindGroup({
            layout: pipeline.getBindGroupLayout(1),
            entries: [
            {
                binding: 0,
                resource: {
                    buffer: cameraUniformBuffer,
                    offset: 0,
                    size: matrixSize*2,
                },
            },
            ],
            label: "camera_bind_group",
        });
    }

    for (let i = 0; i < maxCameras; i++) {
        cameraUniformBindGroups.push(createCameraBindGroup());
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

    let lastUpdate = Date.now();

    function frame() {
        //Manage Clock;
        let now = Date.now();
        deltaTime = now - lastUpdate;
        lastUpdate = now;
        frameNo += 1;
        
        if (gameWindow.hasResized(presentationSize[0], presentationSize[1])) {
            if (depthTexture !== undefined) {
                depthTexture.destroy();
            }
            
            presentationSize[0] = gameWindow.width;
            presentationSize[1] = gameWindow.height;
            
            depthTexture = device.createTexture({
                size: presentationSize,
                format: 'depth24plus',
                usage: GPUTextureUsage.RENDER_ATTACHMENT,
            });

            let depthView = depthTexture.createView();
            renderPassDescriptor.depthStencilAttachment.view = depthView;
            for (let camera of cameras) {
                camera.aspect = presentationSize[0] / presentationSize[1]
            }
        }
        // Sample is no longer the active page.
        if (!pageState.active) return;

        //Update each model in the model list
        for (let model of models) {
            model.onUpdate();
        }

        for (let camera of cameras) {
            camera.onUpdate();
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

        for (let i = 0; i < cameras.length; i++) {
            const viewBuf = cameras[i].viewMatrix() as Float32Array;
            const projBuf = cameras[i].projMatrix() as Float32Array;
            const camBuf = new Float32Array(viewBuf.length + projBuf.length);

            camBuf.set(viewBuf);
            camBuf.set(projBuf, viewBuf.length);
            const offset = 256 * i;
            // console.log("Offset: " + offset + "\n Name:" + models[i].meshName + "\n Matrix: " + matrix);
            device.queue.writeBuffer(
                cameraUniformBuffer,
                offset,
                camBuf.buffer,
                camBuf.byteOffset,
                camBuf.byteLength
            );
        }

        (renderPassDescriptor.colorAttachments as Array<GPURenderPassColorAttachment>)[0].view = context
        .getCurrentTexture()
        .createView();

        const commandEncoder = device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(pipeline);
        passEncoder.setVertexBuffer(0, verticesBuffer);
        passEncoder.setBindGroup(1, cameraUniformBindGroups[0]);
        // passEncoder.draw(cube.vertexCount, 1, 0, 0);

        //Draw each mesh in the map. - Should be changed to draw each mesh for the models.
        //Or draw all meshes with the same material.
        for (let i = 0; i < models.length; i++) {
            const {mesh, offset} = meshMap.get(models[i].meshName);
            passEncoder.setBindGroup(0, uniformBindGroups[i]);
            passEncoder.draw(mesh.vertexCount, 1, offset, 0);
        }

        passEncoder.end();
        device.queue.submit([commandEncoder.finish()]);

        requestAnimationFrame(frame);
    }

    for (let model of models) {
        model.onInit();
        console.log("Initialising models!")
    }
    requestAnimationFrame(frame);
};

export default initRenderer;
