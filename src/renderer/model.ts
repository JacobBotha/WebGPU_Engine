export default class Model {
    private _positions: Float32Array;
    public get positions(): Float32Array {
        return this._positions;
    }
    public set positions(value: Float32Array) {
        this._positions = value;
    }

    private _colors: Float32Array;
    public get colors(): Float32Array {
        return this._colors;
    }
    public set colors(value: Float32Array) {
        this._colors = value;
    }

    private _indices: Uint16Array;
    public get indices(): Uint16Array {
        return this._indices;
    }
    public set indices(value: Uint16Array) {
        this._indices = value;
    }

    constructor(positions: Float32Array, colors: Float32Array, indices: Uint16Array) {
        this._colors = colors;
        this._indices = indices;
        this._positions = positions;
    }
}