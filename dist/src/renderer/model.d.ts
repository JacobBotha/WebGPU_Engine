export default class Model {
    private _positions;
    get positions(): Float32Array;
    set positions(value: Float32Array);
    private _colors;
    get colors(): Float32Array;
    set colors(value: Float32Array);
    private _indices;
    get indices(): Uint16Array;
    set indices(value: Uint16Array);
    constructor(positions: Float32Array, colors: Float32Array, indices: Uint16Array);
}
