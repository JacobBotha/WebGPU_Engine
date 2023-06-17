struct Uniforms {
  modelMatrix : mat4x4<f32>,
}

struct CameraUniform {
    viewMatrix : mat4x4<f32>,
    projMatrix : mat4x4<f32>,
}
@binding(0) @group(0) var<uniform> uniforms : Uniforms;
@binding(0) @group(1) var<uniform> camera : CameraUniform;

struct VertexOutput {
  @builtin(position) Position : vec4<f32>,
  @location(0) fragUV : vec2<f32>,
  @location(1) fragPosition: vec4<f32>,
}

@vertex
fn main(
  @location(0) position : vec4<f32>,
  @location(1) uv : vec2<f32>
) -> VertexOutput {
  var output : VertexOutput;
  var mvp = camera.projMatrix * camera.viewMatrix * uniforms.modelMatrix;
  output.Position = mvp * position;
  output.fragUV = uv;
  output.fragPosition = 0.5 * (position + vec4(1.0, 1.0, 1.0, 1.0));
  return output;
}
