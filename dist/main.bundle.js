(()=>{"use strict";var t=1e-6,e="undefined"!=typeof Float32Array?Float32Array:Array;function o(){var t=new e(16);return e!=Float32Array&&(t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0),t[0]=1,t[5]=1,t[10]=1,t[15]=1,t}function n(t,e,o){var n,r,i,s,a,h,f,c,u,l,d,m,p=o[0],v=o[1],g=o[2];return e===t?(t[12]=e[0]*p+e[4]*v+e[8]*g+e[12],t[13]=e[1]*p+e[5]*v+e[9]*g+e[13],t[14]=e[2]*p+e[6]*v+e[10]*g+e[14],t[15]=e[3]*p+e[7]*v+e[11]*g+e[15]):(n=e[0],r=e[1],i=e[2],s=e[3],a=e[4],h=e[5],f=e[6],c=e[7],u=e[8],l=e[9],d=e[10],m=e[11],t[0]=n,t[1]=r,t[2]=i,t[3]=s,t[4]=a,t[5]=h,t[6]=f,t[7]=c,t[8]=u,t[9]=l,t[10]=d,t[11]=m,t[12]=n*p+a*v+u*g+e[12],t[13]=r*p+h*v+l*g+e[13],t[14]=i*p+f*v+d*g+e[14],t[15]=s*p+c*v+m*g+e[15]),t}Math.random,Math.PI,Math.hypot||(Math.hypot=function(){for(var t=0,e=arguments.length;e--;)t+=arguments[e]*arguments[e];return Math.sqrt(t)});var r=function(t,e,o,n,r){var i,s=1/Math.tan(e/2);return t[0]=s/o,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=s,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[11]=-1,t[12]=0,t[13]=0,t[15]=0,null!=r&&r!==1/0?(i=1/(n-r),t[10]=(r+n)*i,t[14]=2*r*n*i):(t[10]=-1,t[14]=-2*n),t};function i(){var t=new e(3);return e!=Float32Array&&(t[0]=0,t[1]=0,t[2]=0),t}function s(t,o,n){var r=new e(3);return r[0]=t,r[1]=o,r[2]=n,r}function a(t,e,o){return t[0]=e[0]+o[0],t[1]=e[1]+o[1],t[2]=e[2]+o[2],t}function h(t,e,o){return t[0]=e[0]-o[0],t[1]=e[1]-o[1],t[2]=e[2]-o[2],t}function f(t,e,o){return t[0]=e[0]*o,t[1]=e[1]*o,t[2]=e[2]*o,t}i();const c=(t,e)=>{const o=document.createElement("button");return o.onclick=e,o.textContent=t,document.body.appendChild(o),o};var u;!function(t){t[t.SUCESS=0]="SUCESS",t[t.ERROR=1]="ERROR"}(u||(u={}));var l=function(t,e,o,n){return new(o||(o=Promise))((function(r,i){function s(t){try{h(n.next(t))}catch(t){i(t)}}function a(t){try{h(n.throw(t))}catch(t){i(t)}}function h(t){var e;t.done?r(t.value):(e=t.value,e instanceof o?e:new o((function(t){t(e)}))).then(s,a)}h((n=n.apply(t,e||[])).next())}))};const d=new class{constructor(t=40,e=0,o=16,n=32){this._meshes=new Map,this._vertexCount=0,this._vertexSize=t,this._positionOffset=e,this._colorOffset=o,this._uvOffset=n}get vertexSize(){return this._vertexSize}get positionOffset(){return this._positionOffset}get colorOffset(){return this._colorOffset}get uvOffset(){return this._uvOffset}get vertexCount(){return this._vertexCount}get(t){const e=this._meshes.get(t);if(!e)throw new Error("Cannot find mesh!");return e}add(t){if(this._meshes.has(t.meshName))throw new Error("Mesh already in map.");if(this.vertexSize!=t.vertexSize)throw new Error("Cannot add mesh with different vertex size to the ");if(this.positionOffset!=t.positionOffset||this.colorOffset!=t.colorOffset||this.uvOffset!=t.uvOffset)throw new Error("Cannot add mesh with different offsets.");let e=this.vertexCount;this._meshes.set(t.meshName,{mesh:t,offset:e}),this._vertexCount+=t.vertexCount}remove(t){this._meshes.has(t.meshName)&&(this._vertexCount-=t.vertexCount,this._meshes.delete(t.meshName))}forEach(t,e){this._meshes.forEach(t,e)}},m=[],p=[],v=[],g=[],w=t=>100==m.length?(console.log("Cannot add model exceeded max!"),u.ERROR):(m.push(t),u.SUCESS),x=t=>{try{return d.add(t),u.SUCESS}catch(t){return console.log(t),u.ERROR}},y=(t,e,o,n)=>t.createBindGroup({layout:e.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:o,offset:256*n,size:64}}]});let M=0;const b=()=>M/1e3,O=({canvas:t,pageState:e})=>l(void 0,void 0,void 0,(function*(){const o=yield function(t,e,o=!1,n=!1){return l(this,void 0,void 0,(function*(){const r=yield t.requestAdapter({powerPreference:e,forceFallbackAdapter:o});return(null==r?void 0:r.isFallbackAdapter)&&!0===n?null:r}))}(navigator.gpu,"high-performance",!1,!0),n=yield null==o?void 0:o.requestAdapterInfo();if(console.log(null==n?void 0:n.vendor),console.log(null==o?void 0:o.isFallbackAdapter),null==o)throw new Error("Could not find adapter");const r=yield o.requestDevice();if(!e.active)return;const i=t.getContext("webgpu"),s=window.devicePixelRatio||1,a=[t.clientWidth*s,t.clientHeight*s],h=navigator.gpu.getPreferredCanvasFormat();i.configure({device:r,usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.COPY_SRC,format:h,alphaMode:"opaque"});const f=r.createBuffer({size:d.vertexSize*d.vertexCount,usage:GPUBufferUsage.VERTEX,mappedAtCreation:!0});let c=new Float32Array(f.getMappedRange());d.forEach((({mesh:t,offset:e})=>{c.set(t.vertexArray,d.vertexSize/4*e)})),f.unmap();const u=r.createRenderPipeline({layout:"auto",vertex:{module:r.createShaderModule({code:"struct Uniforms {\n  modelMatrix : mat4x4<f32>,\n}\n\nstruct CameraUniform {\n    viewMatrix : mat4x4<f32>,\n    projMatrix : mat4x4<f32>,\n}\n@binding(0) @group(0) var<uniform> uniforms : Uniforms;\n@binding(0) @group(1) var<uniform> camera : CameraUniform;\n\nstruct VertexOutput {\n  @builtin(position) Position : vec4<f32>,\n  @location(0) fragUV : vec2<f32>,\n  @location(1) fragPosition: vec4<f32>,\n}\n\n@vertex\nfn main(\n  @location(0) position : vec4<f32>,\n  @location(1) uv : vec2<f32>\n) -> VertexOutput {\n  var output : VertexOutput;\n  var mvp = camera.projMatrix * camera.viewMatrix * uniforms.modelMatrix;\n  output.Position = mvp * position;\n  output.fragUV = uv;\n  output.fragPosition = 0.5 * (position + vec4(1.0, 1.0, 1.0, 1.0));\n  return output;\n}\n"}),entryPoint:"main",buffers:[{arrayStride:d.vertexSize,attributes:[{shaderLocation:0,offset:d.positionOffset,format:"float32x4"},{shaderLocation:1,offset:d.uvOffset,format:"float32x2"}]}]},fragment:{module:r.createShaderModule({code:"@fragment\nfn main(\n  @location(0) fragUV: vec2<f32>,\n  @location(1) fragPosition: vec4<f32>\n) -> @location(0) vec4<f32> {\n  return fragPosition;\n}\n"}),entryPoint:"main",targets:[{format:h}]},primitive:{topology:"triangle-list",cullMode:"back"},depthStencil:{depthWriteEnabled:!0,depthCompare:"less",format:"depth24plus"}}),w=r.createTexture({size:a,format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT}),x=r.createBuffer({size:25600,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});for(let t=0;t<100;t++)p.push(y(r,u,x,t));const b=r.createBuffer({size:256,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});for(let t=0;t<1;t++)g.push(r.createBindGroup({layout:u.getBindGroupLayout(1),entries:[{binding:0,resource:{buffer:b,offset:0,size:128}}],label:"camera_bind_group"}));const O={colorAttachments:[{view:void 0,resolveTarget:void 0,clearValue:{r:.5,g:.5,b:.5,a:1},loadOp:"clear",storeOp:"store"}],depthStencilAttachment:{view:w.createView(),depthClearValue:1,depthLoadOp:"clear",depthStoreOp:"store"}};let C=Date.now();for(let t of m)t.onInit(),console.log("Initialising models!");requestAnimationFrame((function t(){let o=Date.now();if(M=o-C,C=o,!e.active)return;for(let t of m)t.onUpdate();for(let t of v)t.onUpdate();for(let t=0;t<m.length;t++){const e=m[t].transform,o=256*t;r.queue.writeBuffer(x,o,e.buffer,e.byteOffset,e.byteLength)}for(let t=0;t<v.length;t++){const e=v[t].viewMatrix(),o=v[t].projMatrix(),n=new Float32Array(e.length+o.length);n.set(e),n.set(o,e.length);const i=256*t;r.queue.writeBuffer(b,i,n.buffer,n.byteOffset,n.byteLength)}O.colorAttachments[0].view=i.getCurrentTexture().createView();const n=r.createCommandEncoder(),s=n.beginRenderPass(O);s.setPipeline(u),s.setVertexBuffer(0,f),s.setBindGroup(1,g[0]);for(let t=0;t<m.length;t++){const{mesh:e,offset:o}=d.get(m[t].meshName);s.setBindGroup(0,p[t]),s.draw(e.vertexCount,1,o,0)}s.end(),r.queue.submit([n.finish()]),requestAnimationFrame(t)}))}));class C{constructor(t,e,o,n,r=1,i=1,s=100){this.position=t,this.direction=e,this.up=o,this.aspect=n,this.fovy=r,this.znear=i,this.zfar=s}}class A extends C{constructor(){super(...arguments),this.transform=o(),this.mouseSpeed=.5,this.speed=10,this.horizontalAngle=3.14,this.verticalAngle=0,this.forward=!1,this.backward=!1,this.left=!1,this.right=!1,this.rightDirection=i(),this.initialFov=45,this.rotate=!1,this.lastX=0,this.lastY=0,this.onInit=()=>{document.addEventListener("mousedown",(t=>{this.rotate=!0,this.lastX=t.clientX,this.lastY=t.clientY})),document.addEventListener("mouseup",(()=>{this.rotate=!1})),document.addEventListener("mousemove",(t=>{if(this.rotate){var e,o,n,r,i,a,h,f,c,u=t.clientX,l=t.clientY;this.horizontalAngle+=this.mouseSpeed*b()*(this.lastX-t.clientX),this.verticalAngle+=this.mouseSpeed*b()*(this.lastY-t.clientY),console.log(t.clientX),this.direction=s(Math.cos(this.verticalAngle)*Math.sin(this.horizontalAngle),Math.sin(this.verticalAngle),Math.cos(this.verticalAngle)*Math.cos(this.horizontalAngle)),this.rightDirection=s(Math.sin(this.horizontalAngle-1.57),0,Math.cos(this.horizontalAngle-1.57)),e=this.up,o=this.rightDirection,n=this.direction,r=o[0],i=o[1],a=o[2],h=n[0],f=n[1],c=n[2],e[0]=i*c-a*f,e[1]=a*h-r*c,e[2]=r*f-i*h,this.lastX=u,this.lastY=l}})),document.addEventListener("wheel",(t=>{this.fovy=this.initialFov-5*t.deltaY})),document.addEventListener("keydown",(t=>{"w"==t.key&&(this.forward=!0),"s"==t.key&&(this.backward=!0),"a"==t.key&&(this.left=!0),"d"==t.key&&(this.right=!0)})),document.addEventListener("keyup",(t=>{"w"==t.key&&(this.forward=!1),"s"==t.key&&(this.backward=!1),"a"==t.key&&(this.left=!1),"d"==t.key&&(this.right=!1)}))},this.onUpdate=()=>{if(this.forward){let t=i();f(t,this.direction,b()*this.speed),a(this.position,this.position,t),console.log("Moving Forward!")}if(this.backward){let t=i();f(t,this.direction,b()*this.speed),h(this.position,this.position,t),console.log("Moving Backward!")}if(this.right){let t=i();f(t,this.rightDirection,b()*this.speed),a(this.position,this.position,t),console.log("Moving Right!")}if(this.left){let t=i();f(t,this.rightDirection,b()*this.speed),h(this.position,this.position,t),console.log("Moving Left!")}}}viewMatrix(){let e=o(),n=i();return a(n,this.position,this.direction),r=e,s=this.position,h=n,f=this.up,y=s[0],M=s[1],b=s[2],O=f[0],C=f[1],A=f[2],S=h[0],P=h[1],E=h[2],Math.abs(y-S)<t&&Math.abs(M-P)<t&&Math.abs(b-E)<t?function(t){t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=1,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=1,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1}(r):(v=y-S,g=M-P,w=b-E,c=C*(w*=x=1/Math.hypot(v,g,w))-A*(g*=x),u=A*(v*=x)-O*w,l=O*g-C*v,(x=Math.hypot(c,u,l))?(c*=x=1/x,u*=x,l*=x):(c=0,u=0,l=0),d=g*l-w*u,m=w*c-v*l,p=v*u-g*c,(x=Math.hypot(d,m,p))?(d*=x=1/x,m*=x,p*=x):(d=0,m=0,p=0),r[0]=c,r[1]=d,r[2]=v,r[3]=0,r[4]=u,r[5]=m,r[6]=g,r[7]=0,r[8]=l,r[9]=p,r[10]=w,r[11]=0,r[12]=-(c*y+u*M+l*b),r[13]=-(d*y+m*M+p*b),r[14]=-(v*y+g*M+w*b),r[15]=1),e;var r,s,h,f,c,u,l,d,m,p,v,g,w,x,y,M,b,O,C,A,S,P,E}projMatrix(){const t=o();return r(t,2*Math.PI/5,this.aspect,this.znear,this.zfar),t}}const S={meshName:"cube",vertexArray:new Float32Array([1,-1,1,1,1,0,1,1,1,1,-1,-1,1,1,0,0,1,1,0,1,-1,-1,-1,1,0,0,0,1,0,0,1,-1,-1,1,1,0,0,1,1,0,1,-1,1,1,1,0,1,1,1,1,-1,-1,-1,1,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,-1,1,1,1,0,1,1,0,1,1,-1,-1,1,1,0,0,1,0,0,1,1,-1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,-1,-1,1,1,0,0,1,0,0,-1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,-1,1,1,1,0,1,0,0,-1,1,-1,1,0,1,0,1,1,0,-1,1,1,1,0,1,1,1,1,1,1,1,-1,1,1,1,0,1,0,0,-1,-1,1,1,0,0,1,1,1,1,-1,1,1,1,0,1,1,1,0,1,-1,1,-1,1,0,1,0,1,0,0,-1,-1,-1,1,0,0,0,1,1,0,-1,-1,1,1,0,0,1,1,1,1,-1,1,-1,1,0,1,0,1,0,0,1,1,1,1,1,1,1,1,1,1,-1,1,1,1,0,1,1,1,0,1,-1,-1,1,1,0,0,1,1,0,0,-1,-1,1,1,0,0,1,1,0,0,1,-1,1,1,1,0,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,-1,-1,1,1,0,0,1,1,1,-1,-1,-1,1,0,0,0,1,0,1,-1,1,-1,1,0,1,0,1,0,0,1,1,-1,1,1,1,0,1,1,0,1,-1,-1,1,1,0,0,1,1,1,-1,1,-1,1,0,1,0,1,0,0]),vertexCount:36,vertexSize:40,colorOffset:16,uvOffset:32,positionOffset:0},P={meshName:"pyramid",vertexArray:new Float32Array([0,1,0,1,1,0,1,1,1,1,-1,-1,1,1,0,0,1,1,0,1,1,-1,1,1,0,0,0,1,0,0,0,1,0,1,1,1,1,1,1,1,1,-1,1,1,1,0,1,1,0,1,1,-1,-1,1,1,0,0,1,0,0,0,1,0,1,1,1,1,1,1,1,1,-1,-1,1,1,0,1,1,0,1,-1,-1,-1,1,1,0,0,1,0,0,0,1,0,1,0,0,1,1,1,1,-1,-1,-1,1,0,1,1,1,0,1,-1,-1,1,1,0,1,0,1,0,0,-1,-1,-1,1,1,1,1,1,1,1,1,-1,-1,1,0,1,1,1,0,1,1,-1,1,1,0,0,1,1,0,0,-1,-1,-1,1,0,0,1,1,0,0,1,-1,1,1,0,0,1,1,0,0,-1,-1,1,1,1,1,1,1,1,1]),vertexCount:18,vertexSize:40,colorOffset:16,uvOffset:32,positionOffset:0},E={meshName:"plane",vertexArray:new Float32Array([-1,0,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,1,0,1,1,0,-1,1,1,1,0,1,0,0,-1,0,-1,1,0,1,0,1,1,0,-1,0,1,1,0,1,1,1,1,1,1,0,-1,1,1,1,0,1,0,0]),vertexCount:6,vertexSize:40,colorOffset:16,uvOffset:32,positionOffset:0};if((()=>{const t=navigator.gpu,e=document.getElementById("gpu-check");return t?(e.textContent="WebGPU Enabled!",!0):(e.textContent="Current browser does not support WebGPU!",!1)})()){console.log("Starting Bigworld...");const z=(()=>{const t=document.createElement("canvas"),e=document.getElementById("checker-div");return document.body.insertBefore(t,e),t.id="web-gpu-context",t.width=640,t.height=480,null==e||e.remove(),t})(),R=z.width/z.height,_=o();function k(e=0,r=0,i=0){const a=o();n(a,a,s(e,r,i));const h=Date.now()/1e3;var f,c,u,l,d,m,p,v,g,w,x,y,M,b,O,C,A,S,P,E,U,z,R,k,B,F,N,T,D,G,I;return f=a,c=a,u=s(Math.sin(h),Math.cos(h),0),T=u[0],D=u[1],G=u[2],(I=Math.hypot(T,D,G))<t||(T*=I=1/I,D*=I,G*=I,l=Math.sin(1),m=1-(d=Math.cos(1)),p=c[0],v=c[1],g=c[2],w=c[3],x=c[4],y=c[5],M=c[6],b=c[7],O=c[8],C=c[9],A=c[10],S=c[11],P=T*T*m+d,E=D*T*m+G*l,U=G*T*m-D*l,z=T*D*m-G*l,R=D*D*m+d,k=G*D*m+T*l,B=T*G*m+D*l,F=D*G*m-T*l,N=G*G*m+d,f[0]=p*P+x*E+O*U,f[1]=v*P+y*E+C*U,f[2]=g*P+M*E+A*U,f[3]=w*P+b*E+S*U,f[4]=p*z+x*R+O*k,f[5]=v*z+y*R+C*k,f[6]=g*z+M*R+A*k,f[7]=w*z+b*R+S*k,f[8]=p*B+x*F+O*N,f[9]=v*B+y*F+C*N,f[10]=g*B+M*F+A*N,f[11]=w*B+b*F+S*N,c!==f&&(f[12]=c[12],f[13]=c[13],f[14]=c[14],f[15]=c[15])),function(t,e,o){var n=e[0],r=e[1],i=e[2],s=e[3],a=e[4],h=e[5],f=e[6],c=e[7],u=e[8],l=e[9],d=e[10],m=e[11],p=e[12],v=e[13],g=e[14],w=e[15],x=o[0],y=o[1],M=o[2],b=o[3];t[0]=x*n+y*a+M*u+b*p,t[1]=x*r+y*h+M*l+b*v,t[2]=x*i+y*f+M*d+b*g,t[3]=x*s+y*c+M*m+b*w,x=o[4],y=o[5],M=o[6],b=o[7],t[4]=x*n+y*a+M*u+b*p,t[5]=x*r+y*h+M*l+b*v,t[6]=x*i+y*f+M*d+b*g,t[7]=x*s+y*c+M*m+b*w,x=o[8],y=o[9],M=o[10],b=o[11],t[8]=x*n+y*a+M*u+b*p,t[9]=x*r+y*h+M*l+b*v,t[10]=x*i+y*f+M*d+b*g,t[11]=x*s+y*c+M*m+b*w,x=o[12],y=o[13],M=o[14],b=o[15],t[12]=x*n+y*a+M*u+b*p,t[13]=x*r+y*h+M*l+b*v,t[14]=x*i+y*f+M*d+b*g,t[15]=x*s+y*c+M*m+b*w}(o(),_,a),a}r(_,2*Math.PI/5,R,1,100);class B{constructor(t=i()){this.meshName=S.meshName,this.transform=o(),this.onInit=()=>{console.log("Translating cube")},this.onUpdate=()=>{},this.onDestroy=()=>{},this.startPos=t,n(this.transform,this.transform,t)}}class F{constructor(t=i()){this.meshName=P.meshName,this.onInit=()=>{console.log("Translating cube")},this.onDestroy=()=>{},this.startPos=t,this.transform=o(),n(this.transform,this.transform,this.startPos),console.log(this.transform)}onUpdate(){this.transform=k(this.startPos[0],this.startPos[1],this.startPos[2])}}class N{constructor(t=i(),e=i()){var r,s,a,h,f,c;this.meshName=E.meshName,this.onInit=()=>{},this.onDestroy=()=>{},this.startPos=t,this.transform=o(),n(this.transform,this.transform,this.startPos),r=this.transform,s=this.transform,h=(a=e)[0],f=a[1],c=a[2],r[0]=s[0]*h,r[1]=s[1]*h,r[2]=s[2]*h,r[3]=s[3]*h,r[4]=s[4]*f,r[5]=s[5]*f,r[6]=s[6]*f,r[7]=s[7]*f,r[8]=s[8]*c,r[9]=s[9]*c,r[10]=s[10]*c,r[11]=s[11]*c,r[12]=s[12],r[13]=s[13],r[14]=s[14],r[15]=s[15],console.log(this.transform)}onUpdate(){}}x(P),x(S),x(E);let T=1;w(new N(s(0,0,0),s(10,1,10))),c("Add Cube",(()=>{w(new B(s(0,1,4*T))),T++})),c("Add Pyramid",(()=>{w(new F(s(2,1,4*T))),T++})),U=new A(s(0,0,5),i(),s(0,1,0),R,1,1,100),v.length>=1?u.ERROR:(U.onInit(),v.push(U),u.SUCESS),O({canvas:z,pageState:{active:!0}})}var U})();
//# sourceMappingURL=main.bundle.js.map