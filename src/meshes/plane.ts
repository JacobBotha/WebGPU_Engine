import Mesh from "./mesh";

const vertexSize = 4 * 10; // Byte size of one cube vertex.
const colorOffset = 4 * 4; // Byte offset of cube vertex color attribute.
const positionOffset = 0;
const UVOffset = 4 * 8;
const vertexCount = 6;

const vertexArray = new Float32Array([
  // float4 position, float4 color, float2 uv,
  -1, 0, 1, 1,   0, 1, 1, 1,  1, 1,
  1, 0, 1, 1,    1, 1, 1, 1,  0, 1,
  1, 0, -1, 1,   1, 1, 0, 1,  0, 0,
  -1, 0, -1, 1,  0, 1, 0, 1,  1, 0,
  -1, 0, 1, 1,   0, 1, 1, 1,  1, 1,
  1, 0, -1, 1,   1, 1, 0, 1,  0, 0,
])

const PlaneMesh: Mesh = {
  meshName: "plane",
  vertexArray: vertexArray,
  vertexCount: vertexCount,
  vertexSize: vertexSize,
  colorOffset: colorOffset,
  uvOffset: UVOffset,
  positionOffset: positionOffset
}

export default PlaneMesh;