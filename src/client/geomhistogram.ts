

const HEIGHT = 0.4;
const LEFT = -0.2
const RIGHT = 0.2;
const TOP = -0.20
const BOTTOM = TOP - HEIGHT;
const positions = [
    // top left
    LEFT, TOP, 0, 1,
    // bottom right
    RIGHT, BOTTOM, 1, 0,
    // bottom left
    LEFT, BOTTOM, 0, 0,
    // top left
    LEFT, TOP, 0, 1,
    // top right
    RIGHT, TOP, 1, 1,
    // bottom right
    RIGHT,BOTTOM, 1, 0,
];

export function histogramGeometry(gl: WebGL2RenderingContext) : WebGLBuffer {
    let histogramData : Float32Array = new Float32Array(positions);
    let histogramBuffer : WebGLBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, histogramBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, histogramData, gl.STATIC_DRAW);
    return histogramBuffer;
}

