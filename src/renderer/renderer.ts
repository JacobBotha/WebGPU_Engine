import Model from "./model";
import vertShaderCode from './shaders/vert.wgsl';
import fragShaderCode from './shaders/frag.wgsl';

let frameCount = 0;
/**
 * Helper function for creating static buffers. Specifically for buffers whose
 * data does not change such as simple index or vertex buffers.
 * @param device Device to create the buffer from.
 * @param arr Data to be placed in buffer.
 * @param usage Usage of the buffer.
 * @returns 
 */
const createStaticBuffer = (device: GPUDevice, arr: Float32Array | Uint16Array, usage: number) => {
    //Align to 4 bytes
    let desc = {
        size: (arr.byteLength + 3) & ~3,
        usage,
        mappedAtCreation: true
    };
    let buffer = device.createBuffer(desc);

    const writeArray =
        arr instanceof Uint16Array
            ? new Uint16Array(buffer.getMappedRange())
            : new Float32Array(buffer.getMappedRange());
    writeArray.set(arr);
    buffer.unmap();
    return buffer;
};

export interface RendererSettings {
    powerPreference?: GPUPowerPreference,
    forceFallback?: boolean,
    blockFallback?: boolean,
}

export default class Renderer {
    private _adapter: GPUAdapter | null;
    public get adapter(): GPUAdapter | null {
        return this._adapter;
    }
    private set adapter(value: GPUAdapter | null) {
        this._adapter = value;
    }

    private _device: GPUDevice | null;
    public get device(): GPUDevice | null {
        return this._device;
    }
    private set device(value: GPUDevice | null) {
        this._device = value;
    }

    private _canvas: HTMLCanvasElement;
    public get canvas(): HTMLCanvasElement {
        return this._canvas;
    }
    private set canvas(value: HTMLCanvasElement) {
        this._canvas = value;
    }

    private _context: GPUCanvasContext | null;
    private get context(): GPUCanvasContext | null {
        return this._context;
    }
    private set context(value: GPUCanvasContext | null) {
        this._context = value;
    }

    private _depthTexture: GPUTexture | null;
    public get depthTexture(): GPUTexture | null {
        return this._depthTexture;
    }
    private set depthTexture(value: GPUTexture | null) {
        this._depthTexture = value;
    }

    private _depthTextureView: GPUTextureView | null;
    public get depthTextureView(): GPUTextureView | null {
        return this._depthTextureView;
    }
    private set depthTextureView(value: GPUTextureView | null) {
        this._depthTextureView = value;
    }

    private _colorTexture: GPUTexture | null;
    public get colorTexture(): GPUTexture | null {
        return this._colorTexture;
    }
    private set colorTexture(value: GPUTexture | null) {
        this._colorTexture = value;
    }

    private _colorTextureView: GPUTextureView | null;
    public get colorTextureView(): GPUTextureView | null {
        return this._colorTextureView;
    }
    private set colorTextureView(value: GPUTextureView | null) {
        this._colorTextureView = value;
    }
    
    private _canvasFormat: GPUTextureFormat;
    public get canvasFormat(): GPUTextureFormat {
        return this._canvasFormat;
    }
    private set canvasFormat(value: GPUTextureFormat) {
        this._canvasFormat = value;
    }

    private _vertexBuffer: GPUBuffer | null;
    public get vertexBuffer(): GPUBuffer | null {
        return this._vertexBuffer;
    }
    private set vertexBuffer(value: GPUBuffer | null) {
        this._vertexBuffer = value;
    }

    private _colorBuffer: GPUBuffer | null;
    public get colorBuffer(): GPUBuffer | null {
        return this._colorBuffer;
    }
    private set colorBuffer(value: GPUBuffer | null) {
        this._colorBuffer = value;
    }

    private _indexBuffer: GPUBuffer | null;
    public get indexBuffer(): GPUBuffer | null {
        return this._indexBuffer;
    }
    private set indexBuffer(value: GPUBuffer | null) {
        this._indexBuffer = value;
    }
    
    private _vertModule: GPUShaderModule | null;
    public get vertModule(): GPUShaderModule | null {
        return this._vertModule;
    }
    private set vertModule(value: GPUShaderModule | null) {
        this._vertModule = value;
    }

    private _fragModule: GPUShaderModule | null;
    public get fragModule(): GPUShaderModule | null {
        return this._fragModule;
    }
    private set fragModule(value: GPUShaderModule | null) {
        this._fragModule = value;
    }

    private _uniformBuffer: GPUBuffer | null;
    public get uniformBuffer(): GPUBuffer | null {
        return this._uniformBuffer;
    }
    private set uniformBuffer(value: GPUBuffer | null) {
        this._uniformBuffer = value;
    }

    private _uniformBindGroupLayout: GPUBindGroupLayout | null;
    public get uniformBindGroupLayout(): GPUBindGroupLayout | null {
        return this._uniformBindGroupLayout;
    }
    private set uniformBindGroupLayout(value: GPUBindGroupLayout | null) {
        this._uniformBindGroupLayout = value;
    }

    private _uniformBindGroup: GPUBindGroup | null;
    public get uniformBindGroup(): GPUBindGroup | null {
        return this._uniformBindGroup;
    }
    private set uniformBindGroup(value: GPUBindGroup | null) {
        this._uniformBindGroup = value;
    }

    private _pipelineLayout: GPUPipelineLayout | null;
    public get pipelineLayout(): GPUPipelineLayout | null{
        return this._pipelineLayout;
    }
    private set pipelineLayout(value: GPUPipelineLayout | null) {
        this._pipelineLayout = value;
    }

    private _graphicsPipeline: GPURenderPipeline | null;
    public get graphicsPipeline(): GPURenderPipeline | null {
        return this._graphicsPipeline;
    }
    public set graphicsPipeline(value: GPURenderPipeline | null) {
        this._graphicsPipeline = value;
    }

    private _commandEncoder: GPUCommandEncoder | null;
    public get commandEncoder(): GPUCommandEncoder | null {
        return this._commandEncoder;
    }
    private set commandEncoder(value: GPUCommandEncoder | null) {
        this._commandEncoder = value;
    }

    private _passEncoder: GPURenderPassEncoder | null;
    public get passEncoder(): GPURenderPassEncoder | null {
        return this._passEncoder;
    }
    private set passEncoder(value: GPURenderPassEncoder | null) {
        this._passEncoder = value;
    }

    private _queue: GPUQueue | null;
    public get queue(): GPUQueue | null {
        return this._queue;
    }
    private set queue(value: GPUQueue | null) {
        this._queue = value;
    }

    constructor(canvas: HTMLCanvasElement, settings?:RendererSettings) {
        this._adapter = null;
        this._device = null;
        this._canvas = canvas;
        //TODO: Compiler complain about type conversion (only after file changes though)
        this._context = this.canvas.getContext('webgpu') as unknown as GPUCanvasContext;
        this._depthTexture = null;
        this._depthTextureView = null;
        this._colorTexture = null;
        this._colorTextureView = null;
        this._canvasFormat = 'bgra8unorm';
        this._vertexBuffer = null;
        this._colorBuffer = null;
        this._indexBuffer = null;
        this._vertModule = null;
        this._fragModule = null;
        this._uniformBuffer = null;
        this._pipelineLayout = null;
        this._uniformBindGroup = null;
        this._uniformBindGroupLayout = null;
        this._graphicsPipeline = null;
        this._commandEncoder = null;
        this._passEncoder = null;
        this._queue = null;
    }

    async init() {
        const entry = navigator.gpu;
        if (!entry)
            throw new Error('WebGPU is not supported on this browser.');

        //Setup Adapter
        this.adapter = await this.selectAdapter(entry);
        if (this.adapter == null)
            throw new Error("Could not select appropriate addapter!");

        //TODO: Logic surrounding retrying for another adapter if missing features?

        this.device = await this.selectDevice(this.adapter);
        if (this.device == null) 
            throw new Error("Could not select appropriate device!");

        this.configureContext(this.device, entry.getPreferredCanvasFormat());
        this.initDepthAttachment(this.device);
        this.initColorAttachment();
        this.initShaders();
    }

    shutdown() {
        this.vertexBuffer?.destroy();
        this.indexBuffer?.destroy();
        this.colorBuffer?.destroy();

        this.colorTexture?.destroy();
        this.depthTexture?.destroy();
        this.device?.destroy();
    }

    loadModel(model: Model) {
        //TODO: Handle multiple model loads or replacements
        if (this.vertexBuffer != null) {
            throw new Error('Model already loaded!')
        }

        if (this.device == null) {
            throw new Error('Cannot load model for uninitialised Renderer!')
        }

        this.vertexBuffer = createStaticBuffer(this.device, model.positions, GPUBufferUsage.VERTEX);
        this.colorBuffer = createStaticBuffer(this.device, model.colors, GPUBufferUsage.VERTEX);
        this.indexBuffer = createStaticBuffer(this.device, model.indices, GPUBufferUsage.INDEX);
    }

    loadUniforms(uniformData: Float32Array) {
        //TODO: Handle update uniform

        //Potentially expensive to perform a null check every frame (if updating uniforms often) 
        if (this.device == null) {
            throw new Error('Cannot upload uniform data for uninitialised Renderer!');
        }

        if (this.uniformBuffer == null) {
            this.uniformBuffer = createStaticBuffer(this.device, uniformData, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);
        } else {
            throw new Error("Uniform already loaded.");
        }
    } 

    private initBindGroups(device: GPUDevice) {
        if (this.uniformBuffer == null) {
            throw new Error("Cannot create uniform bind group before uniform buffer");
        }

        this.uniformBindGroupLayout = device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {}
                }
            ]
        });
        this.uniformBindGroup = device.createBindGroup({
            layout: this.uniformBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.uniformBuffer
                    }
                }
            ]
        });

    }

    createGraphicsPipeline() {
        if (this.device == null) {
            throw new Error("Cannot create pipeline with null device!");
        }

        // passEncoder.setBindGroup(0, uniformBindGroup);
        const positionAttribDesc: GPUVertexAttribute = {
            shaderLocation: 0, // @location(0)
            offset: 0,
            format: 'float32x3'
        };
        const colorAttribDesc: GPUVertexAttribute = {
            shaderLocation: 1, // @location(1)
            offset: 0,
            format: 'float32x3'
        };
        const positionBufferDesc: GPUVertexBufferLayout = {
            attributes: [positionAttribDesc],
            arrayStride: 4 * 3, // sizeof(float) * 3
            stepMode: 'vertex'
        };
        const colorBufferDesc: GPUVertexBufferLayout = {
            attributes: [colorAttribDesc],
            arrayStride: 4 * 3, // sizeof(float) * 3
            stepMode: 'vertex'
        };

        //TODO: store depth format so is shared variable with initDepthAttachment
        // 🌑 Depth
        const depthStencil: GPUDepthStencilState = {
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth24plus-stencil8'
        };

        // 🦄 Uniform Data
        // const pipelineLayoutDesc = { bindGroupLayouts: [] };
        // const layout = device.createPipelineLayout(pipelineLayoutDesc);
        this.initBindGroups(this.device);
        const layout = this.initPipelineLayout(this.device);

        // 🎭 Shader Stages
        if (this.vertModule == null || this.fragModule == null) {
            throw new Error("Cannot create graphics pipeline without shader modules!");
        }
        const vertex: GPUVertexState = {
            module: this.vertModule,
            entryPoint: 'main',
            buffers: [positionBufferDesc, colorBufferDesc]
        };

        // 🌀 Color/Blend State
        //TODO: Test with other value i.e canvasFormat all possibilites.
        const colorState: GPUColorTargetState = {
            format: this.canvasFormat
        };

        const fragment: GPUFragmentState = {
            
            module: this.fragModule,
            entryPoint: 'main',
            targets: [colorState]
        };

        //TODO: Parametize rasterization.
        // 🟨 Rasterization
        const primitive: GPUPrimitiveState = {
            frontFace: 'cw',
            cullMode: 'none',
            topology: 'triangle-list'
        };

        const pipelineDesc: GPURenderPipelineDescriptor = {
            layout,
            vertex,
            fragment,
            primitive,
            depthStencil
        };

        this.graphicsPipeline = this.device.createRenderPipeline(pipelineDesc);
        console.log("Successfully created graphics pipeline!");
    }

    render() {
        // ⏭ Acquire next image from context
        frameCount = frameCount + 1;
        if (this.context == null) {
            throw new Error("Cannot render without a context!");
        }
        this.colorTexture = this.context.getCurrentTexture();
        this.colorTextureView = this.colorTexture.createView();

        // 📦 Write and submit commands to queue
        this.queueCommands();

        // ➿ Refresh canvas
        requestAnimationFrame(this.render.bind(this));
    };

    private queueCommands() {
        //TODO: Double null check every frame potentially expensive!
        if (this.colorTextureView == null || this.depthTextureView == null || this.device == null) {
            throw new Error("Cannot write to command buffer without texture views!")
        }
        let colorAttachment: GPURenderPassColorAttachment = {
            view: this.colorTextureView,
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            loadOp: 'clear',
            storeOp: 'store'
        };

        const depthAttachment: GPURenderPassDepthStencilAttachment = {
            view: this.depthTextureView,
            depthClearValue: 1,
            depthLoadOp: 'clear',
            depthStoreOp: 'store',
            stencilClearValue: 0,
            stencilLoadOp: 'clear',
            stencilStoreOp: 'store'
        };

        const renderPassDesc: GPURenderPassDescriptor = {
            colorAttachments: [colorAttachment],
            depthStencilAttachment: depthAttachment
        };

        this.commandEncoder = this.device.createCommandEncoder();
        
        if (this.graphicsPipeline == null) {
            throw new Error("Cannot write command buffer without initialised pipeline!")
        }

        // 🖌️ Encode drawing commands
        this.passEncoder = this.commandEncoder.beginRenderPass(renderPassDesc);
        this.passEncoder.setPipeline(this.graphicsPipeline);
        this.passEncoder.setViewport(0, 0, this.canvas.width, this.canvas.height, 0, 1);
        this.passEncoder.setScissorRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.indexBuffer == null || this.vertexBuffer == null || this.colorBuffer == null) {
            throw new Error("Cannot write command buffer without a model loaded")!
        }
        this.passEncoder.setVertexBuffer(0, this.vertexBuffer);
        this.passEncoder.setVertexBuffer(1, this.colorBuffer);
        this.passEncoder.setIndexBuffer(this.indexBuffer, 'uint16');
        this.passEncoder.drawIndexed(3);
        this.passEncoder.end();

        this.queue?.submit([this.commandEncoder.finish()]);
    };
    
    private initPipelineLayout(device: GPUDevice) {
        if (this.uniformBindGroupLayout == null) {
            throw new Error("Cannot initialise pipeline layout with all bind group layouts being initialised!");
        }
        const pipelineLayoutDesc: GPUPipelineLayoutDescriptor = { bindGroupLayouts: [this.uniformBindGroupLayout] };
        return device.createPipelineLayout(pipelineLayoutDesc);
    }

    private initShaders() {
        if (this.device == null) {
            throw new Error('Cannot load shaders without device!');
        }

        const vsmDesc = { code: vertShaderCode };
        this.vertModule = this.device.createShaderModule(vsmDesc);

        const fsmDesc = { code: fragShaderCode };
        this.fragModule = this.device.createShaderModule(fsmDesc);
    }

    private initDepthAttachment(device: GPUDevice) {
        //Note: Adding a formatview to this list may have a significant performance impact, so it is best to avoid adding formats unnecessarily.
        const depthTextureDesc: GPUTextureDescriptor = {
            size: [this.canvas.width, this.canvas.height, 1],
            dimension: '2d',
            mipLevelCount: 1,
            sampleCount: 1,
            format: 'depth24plus-stencil8',
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
        };

        this.depthTexture = device.createTexture(depthTextureDesc);
        this.depthTextureView = this.depthTexture.createView();
    }

    private initColorAttachment() {
        if (this.context == null) return;
        this.colorTexture = this.context.getCurrentTexture();
        this.colorTextureView = this.colorTexture.createView();
    }

    private configureContext(device: GPUDevice, format: GPUTextureFormat) {
        if (this.context == null)
            throw new Error("GPU Context is null or undefined.");

        const configuration: GPUCanvasConfiguration = {
            device: device,
            format: format,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
            alphaMode: 'opaque'
        }
        this.context.configure(configuration);

        console.log("Context is configured.");
    }

    private async selectAdapter(
        entry: GPU, 
        powerPreference?: GPUPowerPreference, 
        forceFallback = false, 
        blockFallback = false
    ) {
        const adapter = await entry.requestAdapter({powerPreference: powerPreference, forceFallbackAdapter: forceFallback});

        const info = adapter?.requestAdapterInfo();
        if (adapter?.isFallbackAdapter && blockFallback === true) 
            return null;

        return adapter;
    }

    private async selectDevice(
        adapter: GPUAdapter, 
        requiredFeatures: GPUFeatureName[] = [], 
        requiredLimits: Record<string, GPUSize64> = {},
    ) {
        let device = await adapter.requestDevice({
            requiredFeatures: requiredFeatures,
            requiredLimits: requiredLimits,
        });

        device.lost.then(async (info) => {
            console.error(`WebGPU device was lost: ${info.message}`);

            this.device = null;

            // Many causes for lost devices are transient, so applications should try getting a
            // new device once a previous one has been lost unless the loss was caused by the
            // application intentionally destroying the device. Note that any WebGPU resources
            // created with the previous device (buffers, textures, etc) will need to be
            // re-created with the new one.
            if (info.reason != 'destroyed') {
                this.device = await this.selectDevice(adapter, requiredFeatures, requiredLimits);
                this.configureContext(this.device, this.canvasFormat);
                this.initDepthAttachment(this.device);
                this.initColorAttachment();
                this.initShaders();
            }
        });

        return device
    }
}