//Byte size of float multiplied by 10 floats (4 pos, 4 color, 2 uv)
const defaultVertexSize = 40;
const defaultPositionOffset = 40;
const defaultColorOffset = 40;
const defaultUVOffset = 40;

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
    private _meshes = new Map<string, Mesh>;
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

    get positionOffest(): number {
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

    add(mesh: Mesh) {
        if(this._meshes.has(mesh.meshName)) {
            throw new Error("Mesh already in map.");
        }

        if(this.vertexSize != mesh.vertexSize) {
            throw new Error("Cannot add mesh with different vertex size to the ")
        }

        if (this.positionOffest != mesh.positionOffset || 
            this.colorOffset != mesh.positionOffset || 
            this.uvOffset != mesh.uvOffset) 
        {
            throw new Error("Cannot add mesh with different offsets.")
        }

        this._meshes.set(mesh.meshName, mesh);
        this._vertexCount += mesh.vertexCount;
    }

    remove(mesh: Mesh) {
      if(this._meshes.has(mesh.meshName)) {
        this._meshes.delete(mesh.meshName);
      }
    }
}
