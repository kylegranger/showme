import { IHistogram } from "./core";


const HISTOGRAM_WIDTH: number = 256;

function createHistogramTexture(gl: WebGL2RenderingContext, summary: IHistogram) : WebGLTexture {

    // we draw the histogram on its side, and then rotate 90 degress when displaying
    // each row of texture corresponds to one column of the histogram, whose height varies
    // with the corresponding count for that entry.
    let height = summary.counts.length;
    console.log('histogram height is ', height);
    const npixels = HISTOGRAM_WIDTH * height;
    const data = new Uint8Array(npixels*4);
    let n = 0;
    for (let y = 0; y < height; y++) {
        let h = Math.floor(summary.counts[y]/summary.max_count * HISTOGRAM_WIDTH + 0.5);
        console.log(`y ${y} h ${h} `)
        for (let x = 0; x < HISTOGRAM_WIDTH; x++ ) {
            if (x < h) {
                // use black where the data is valid
                data[n+0] = 255
                data[n+1] = 0
                data[n+2] = 0
            } else {
                // white for background
                data[n+0] = 0
                data[n+1] = 255
                data[n+2] = 0
            }
            data[n+3] = 255
            n += 4
        }
    }
    console.log('  n is ', n);
    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        HISTOGRAM_WIDTH, height, border, srcFormat, srcType,
        data);

    gl.generateMipmap(gl.TEXTURE_2D);

    return texture;
}


export function getHistogramTexture(gl: WebGL2RenderingContext, histograms: IHistogram [], label: string) : WebGLTexture {
    for (let histogram of histograms) {
        if (histogram.label == label) {
            return createHistogramTexture(gl, histogram);
        }
    }
    return null;
}

