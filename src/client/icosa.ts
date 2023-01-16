
const positions = [
    0.000000, -0.525731, 0.850651,
    0.850651, 0.000000, 0.525731,
    0.850651, 0.000000, -0.525731,
    -0.850651, 0.000000, -0.525731,
    -0.850651, 0.000000, 0.525731,
    -0.525731, 0.850651, 0.000000,
    0.525731, 0.850651, 0.000000,
    0.525731, -0.850651, 0.000000,
    -0.525731, -0.850651, 0.000000,
    0.000000, -0.525731, -0.850651,
    0.000000, 0.525731, -0.850651,
    0.000000, 0.525731, 0.850651,
]
const normals = [
    0.934172, 0.356822, 0.000000,
    0.934172, -0.356822, 0.000000,
    -0.934172, 0.356822, 0.000000,
    -0.934172, -0.356822, 0.000000,
    0.000000, 0.934172, 0.356822,
    0.000000, 0.934172, -0.356822,
    0.356822, 0.000000, -0.934172,
    -0.356822, 0.000000, -0.934172,
    0.000000, -0.934172, -0.356822,
    0.000000, -0.934172, 0.356822,
    0.356822, 0.000000, 0.934172,
    -0.356822, 0.000000, 0.934172,
    0.577350, 0.577350, -0.577350,
    0.577350, 0.577350, 0.577350,
    -0.577350, 0.577350, -0.577350,
    -0.577350, 0.577350, 0.577350,
    0.577350, -0.577350, -0.577350,
    0.577350, -0.577350, 0.577350,
    -0.577350, -0.577350, -0.577350,
    -0.577350, -0.577350, 0.577350,
]

// 1..12, copied from OBJ file
const indices = [
    2, 3, 7,
    2, 8, 3,
    4, 5, 6,
    5, 4, 9,
    7, 6, 12,
    6, 7, 11,
    10, 11, 3,
    11, 10, 4,
    8,  9, 10,
    9, 8, 1,
    12, 1, 2,
    1, 12, 5,
    7, 3, 11,
    2, 7, 12,
    4, 6, 11,
    6, 5, 12,
    3, 8, 10,
    8, 2, 1,
    4, 10, 9,
    5, 9, 1
]

export function initIcosa(gl: WebGL2RenderingContext) : WebGLBuffer {
    console.log('initIcosa')

    let size = 20 * 3 * 3;
    let icosaData : Float32Array = new Float32Array(size)
    let i = 0;
    let scale = 5;
    for (let poly = 0; poly < 20; poly++) {
        for (let vert = 0; vert < 3; vert++) {
            let index = indices[poly*3 + vert] - 1
            // set vertex position
            icosaData[i+0] = positions[index*3 + 0] * scale;
            icosaData[i+1] = positions[index*3 + 1] * scale;
            icosaData[i+2] = positions[index*3 + 2] * scale;
            // console.log('x: ',icosaData[i+0])
            // console.log('y: ',icosaData[i+1])
            // console.log('z: ',icosaData[i+2])
            i += 3
            // // set normal, same for all face vertices
            // icosaData[i++] = normals[poly*3 + 0];
            // icosaData[i++] = normals[poly*3 + 1];
            // icosaData[i++] = normals[poly*3 + 2];
        }
    }

    console.log('done data init, gl: ', gl);
    let icosaBuffer : WebGLBuffer = gl.createBuffer()
    console.log('done 1')
    gl.bindBuffer(gl.ARRAY_BUFFER, icosaBuffer);
    console.log('done 2')
    gl.bufferData(gl.ARRAY_BUFFER, icosaData, gl.STATIC_DRAW);
    console.log('done 3')
    // gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
    // gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
    // gl.enableVertexAttribArray(0);
    // gl.enableVertexAttribArray(6);
    return icosaBuffer;

}
