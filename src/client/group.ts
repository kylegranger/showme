/// <reference path="../../node_modules/@webgpu/types/dist/index.d.ts" />

export class CGroup {

    public vao: WebGLVertexArrayObject;
    public transformBuffer: WebGLBuffer;
    public transformData: Float32Array;
    // public geometry: WebGLBuffer;

    public constructor() {
        this.vao = null;
        this.transformBuffer = null;
        this.transformData = null;
        // this.geometry = null;
    }

}