//Byte size of float multiplied by 10 floats (4 pos, 4 color, 2 uv)
const defaultVertexSize = 40;
const defaultPositionOffset = 0;
const defaultColorOffset = 16;
const defaultUVOffset = 32;

export default interface Mesh {
    readonly meshName: string; //Used to identify the mesh in the map.  
    readonly vertexSize: number;
    readonly vertexCount: number;
    readonly positionOffset: number;
    readonly colorOffset: number;
    readonly uvOffset: number;
    readonly vertexArray: Float32Array;
};
    
export class MeshMap {
    private _meshes = new Map<string, {mesh: Mesh, offset: number}>;
    private _vertexCount: number = 0;
    private _vertexSize: number;
    private _positionOffset: number;
    private _colorOffset: number;
    private _uvOffset: number;
    
    constructor(
        vertexSize = defaultVertexSize, 
        positionOffset = defaultPositionOffset, 
        colorOffset = defaultColorOffset,
        uvOffset = defaultUVOffset,
    ) {
        this._vertexSize = vertexSize;
        this._positionOffset = positionOffset;
        this._colorOffset = colorOffset;
        this._uvOffset = uvOffset;
    }

    get vertexSize(): number {
        return this._vertexSize;
    }

    get positionOffset(): number {
        return this._positionOffset;
    }

    get colorOffset(): number {
        return this._colorOffset;
    }

    get uvOffset(): number {
        return this._uvOffset;
    }

    get vertexCount(): number {
        return this._vertexCount;
    }

    get(name: string) {
        const mesh = this._meshes.get(name);
        if(!mesh) {
            throw new Error("Cannot find mesh!")
        }

        return mesh;
    }

    add(mesh: Mesh) {
        if(this._meshes.has(mesh.meshName)) {
            throw new Error("Mesh already in map.");
        }

        if(this.vertexSize != mesh.vertexSize) {
            throw new Error("Cannot add mesh with different vertex size to the ")
        }

        if (this.positionOffset != mesh.positionOffset || 
            this.colorOffset != mesh.colorOffset || 
            this.uvOffset != mesh.uvOffset) 
        {
            throw new Error("Cannot add mesh with different offsets.")
        }

        let offset = this.vertexCount;
        if (this.vertexCount > 0) {
            offset -= 1;
        }

        this._meshes.set(mesh.meshName, {mesh, offset});
        console.log(this.vertexCount);
        this._vertexCount += mesh.vertexCount;
    }

    //Currently not working - Does not reasess offsets of other meshes.
    remove(mesh: Mesh) {
        if(this._meshes.has(mesh.meshName)) {
            this._vertexCount -= mesh.vertexCount;
            this._meshes.delete(mesh.meshName);
        }
    }

    /**
     * Executes a provided function once per each key/value pair in the Map, in insertion order.
     */
    forEach(callbackfn: (value: {mesh: Mesh, offset: number}, key: string, map: Map<string, {mesh: Mesh, offset:number}>) => void, thisArg?: any): void {
        this._meshes.forEach(callbackfn, thisArg);
    }
}
