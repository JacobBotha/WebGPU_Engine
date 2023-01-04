import CubeMesh from '../meshes/cube';

import basicVertWGSL from './shaders/basic.vert.wgsl';
import vertexPositionColorWGSL from './shaders/vertexPositionColor.frag.wgsl';
import { mat4, vec3 } from 'gl-matrix';
import Mesh, { MeshMap } from '../meshes/mesh';
import Model from './model';
import { BWResult } from '../helper';
import SquarePyramidMesh from '../meshes/square_pyramid';

export type RenderInit = (params: {
    canvas: HTMLCanvasElement;
    pageState: { active: boolean};
}) => void | Promise<void>;

//Should be moved out of rend.
const cube = CubeMesh;
const sqPyramid = SquarePyramidMesh;

//Map for storing all active meshes used in the scene.
const meshMap = new MeshMap();

/**
 * Draw a model to the screen with at the models given transform. The mesh of
 * the model will need to have been loaded already and will return ERROR 
 * BWResult if not.
 * 
 * @param model Model to be drawn.
 * @return BWResult
 */
export const drawModel = (model: Model) : BWResult => {
    // meshMap.add()
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

loadMesh(cube);
loadMesh(sqPyramid);

/**
 * Begins the renderer including the draw loop. If renderer could not be
 * initialised an error is thrown.
 * 
 * @param param0 Dictionary containing canvas and pagestate information.
 */
const initRenderer: RenderInit = async ({canvas, pageState}) => {
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
        size: cube.vertexSize * cube.vertexCount,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true,
    });
    new Float32Array(verticesBuffer.getMappedRange()).set(cube.vertexArray);
    verticesBuffer.unmap();

    const pipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
            module: device.createShaderModule({
                code: basicVertWGSL,
            }),
            entryPoint: 'main',
            buffers: [
                {
                arrayStride: cube.vertexSize,
                attributes: [
                    {
                    // position
                    shaderLocation: 0,
                    offset: cube.positionOffset,
                    format: 'float32x4',
                    },
                    {
                    // uv
                    shaderLocation: 1,
                    offset: cube.uvOffset,
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

    const uniformBufferSize = 4 * 16; // 4x4 matrix
    const uniformBuffer = device.createBuffer({
        size: uniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const uniformBindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
        {
            binding: 0,
            resource: {
            buffer: uniformBuffer,
            },
        },
        ],
    });

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

    function getTransformationMatrix() {
        const viewMatrix = mat4.create();
        mat4.translate(viewMatrix, viewMatrix, vec3.fromValues(0, 0, -4));
        const now = Date.now() / 1000;
        mat4.rotate(
        viewMatrix,
        viewMatrix,
        1,
        vec3.fromValues(Math.sin(now), Math.cos(now), 0)
        );

        const modelViewProjectionMatrix = mat4.create();
        mat4.multiply(modelViewProjectionMatrix, projectionMatrix, viewMatrix);

        return modelViewProjectionMatrix as Float32Array;
    }

    function frame() {
        // Sample is no longer the active page.
        if (!pageState.active) return;

        const transformationMatrix = getTransformationMatrix();
        device.queue.writeBuffer(
        uniformBuffer,
        0,
        transformationMatrix.buffer,
        transformationMatrix.byteOffset,
        transformationMatrix.byteLength
        );
        (renderPassDescriptor.colorAttachments as Array<GPURenderPassColorAttachment>)[0].view = context
        .getCurrentTexture()
        .createView();

        const commandEncoder = device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(pipeline);
        passEncoder.setBindGroup(0, uniformBindGroup);
        passEncoder.setVertexBuffer(0, verticesBuffer);
        passEncoder.draw(cube.vertexCount, 1, 0, 0);
        passEncoder.end();
        device.queue.submit([commandEncoder.finish()]);

        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
};

export default initRenderer;