
import { a } from './globals'
import { EShader, IShader } from './core'

export var glShaders : WebGLProgram []


export function createProgram(shader: IShader) : WebGLProgram {
    let gl = a.gl
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexShader, shader.vertex)
    gl.compileShader(vertexShader)
  
    var compiled = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
    var compilationLog = gl.getShaderInfoLog(vertexShader);
  
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragmentShader, shader.fragment)
    gl.compileShader(fragmentShader)
  
    compiled = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
    compilationLog = gl.getShaderInfoLog(fragmentShader);
  
    let program : WebGLProgram = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
  
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
        return null;
    }
    return program
}

export function initShadersGl() {
    glShaders = new Array(EShader.Last)
    for (let i = 0; i < EShader.Last; i++) {
      glShaders[i] = createProgram(glslSrc[i])
    }
    a.gl.useProgram(glShaders[0]);
}


// const glslTabla : IShader = {
//   vertex: `#version 300 es
//   #pragma vscode_glsllint_stage: vert
// layout(location=0) in vec3 a_Position;
// uniform mat4 mvp;
// uniform vec4 info;
// out vec2 top_uv;
// out vec3 tabla_pos;
// void main(){
//   top_uv = vec2(a_Position.x/350.0, a_Position.y/350.0);
//   tabla_pos = a_Position;
//   gl_Position = mvp * vec4(a_Position, 1.0);
// }
// `,
//   fragment: `#version 300 es
//   #pragma vscode_glsllint_stage: frag
// #precision highp float;
// in vec2 top_uv;
// in vec3 tabla_pos;
// uniform vec3 cameraPos;
// uniform sampler2D tablaTexture;
// uniform samplerCube cieloTexture;
// void main() {
//     vec3 normal = vec3(0.0, 0.0, 1.0);
//     vec3 I = normalize(tabla_pos - cameraPos);
//     vec3 R = reflect(I, normal);
//     vec3 RR = vec3(R.x,R.z,-R.y);
//     vec4 skyColor = textureCube(cieloTexture, RR);
//     gl_FragColor = texture2D(tablaTexture, top_uv) * 0.7 + skyColor * 0.3;
//     //gl_FragColor = texture2D(tablaTexture, top_uv);
// }
// `
// }




// const vertexShaderSrc = `#version 300 es
// #pragma vscode_glsllint_stage: vert
// layout(location=0) in vec4 aPosition;
// layout(location=1) in vec3 aOffset;
// layout(location=2) in float aScale;
// layout(location=3) in vec4 aColor;
// layout(location=4) in vec2 aTexCoord;
// layout(location=5) in float aDepth;
// out vec3 vNormal;
// out vec4 vColor;
// void main()
// {
//     vTexCoord = aTexCoord;
//     vDepth = aDepth;
//     gl_Position = vec4(aPosition.xyz * aScale + aOffset, 1.0);
// }`;

// const fragmentShaderSrc = `#version 300 es
// #pragma vscode_glsllint_stage: frag
// precision mediump float;
// uniform mediump sampler2DArray uSampler;
// in vec2 vTexCoord;
// in float vDepth;
// out vec4 fragColor;
// void main()
// {
//     fragColor = texture(uSampler, vec3(vTexCoord, vDepth));
// }`;

const glslIcosa : IShader = {
    vertex: `#version 300 es
  in vec3 a_position;
  in vec4 a_color;
  in mat4 a_mvp;
  out vec4 vColor;
    void main(){
    vColor = a_color;
    gl_Position = a_mvp * vec4(a_position, 1.0);
  }
  `,
    fragment: `#version 300 es
  precision highp float;
  in vec4 vColor;
  out vec4 fragColor;
  void main() {
    fragColor = vColor;
  }
  `
  }
  


let glslSrc : IShader [] = [
    glslIcosa
]
