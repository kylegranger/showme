/// <reference path="../../node_modules/@webgpu/types/dist/index.d.ts" />

import { IState, EShader } from './core'
import { a } from './globals';
import { CNode } from './node'
import { vec2, vec3, vec4, mat4 } from 'gl-matrix'
import { initIcosa } from './icosa'
import { initWorldMap } from './worldmap'
import { glShaders } from './shaders';
import { createRandomTexture, loadTexture } from './util';


const NODE_TRANSFORM_SIZE: number = 24;


export class CWorld {
    public istate: IState
    public nodes: CNode []
    public  gl: WebGL2RenderingContext
    private noiseTexture: WebGLTexture
    private worldMapTexture: WebGLTexture

    public topTexture: WebGLTexture
    public inDrag: boolean
    public inTap: boolean
    public inDragStartTime: number
    public mouseIsOut: boolean
    public inSwipe: boolean
    public inTouchX: number
    public inTouchY: number
    public inTouchTime: number
    private lastTime: number
    private icosaGeometry: WebGLBuffer
    private worldMapGeometry: WebGLBuffer
    private transformBuffer: WebGLBuffer
    private transformData: Float32Array
    private icosaVao: WebGLVertexArrayObject
    private worldMapVao: WebGLVertexArrayObject
    public icosaVPLoc: WebGLUniformLocation
    public worldMapVPLoc: WebGLUniformLocation
    public paramsLoc: WebGLUniformLocation
    public noiseTextureLoc: WebGLUniformLocation
    public worldMapTextureLoc: WebGLUniformLocation
    private startTime: number
    private params: vec4

    public constructor(istate: IState, gl: WebGL2RenderingContext) {
        this.istate = istate
        this.gl = gl
        this.inDrag = false
        this.mouseIsOut = true
        this.lastTime = 0
        this.nodes = new Array()
        this.startTime = Date.now()
        this.params = vec4.create()
    }



    // private createDrawList() {
    //     this.setTableBounds();
    //     this.drawlist = new Array()
    //     for ( let group of this.groups ) {
    //         if (group.position[0] + group.radius < this.minX) {
    //             continue
    //         }
    //         if (group.position[0] - group.radius > this.maxX) {
    //             continue
    //         }
    //         if (group.position[1] + group.radius < this.minY) {
    //             continue
    //         }
    //         if (group.position[1] - group.radius > this.maxY) {
    //             continue
    //         }
    //         this.drawlist.push(group)
    //     }
    //     if (this.listsize != this.drawlist.length) {
    //         this.listsize = this.drawlist.length
    //         console.log('this.listsize = ' + this.listsize)
    //     }
    // }

    // private clampCamera() {
    //     if (a.cameraX < -a.tabla.width/2) {
    //         a.cameraX = -a.tabla.width/2
    //     }
    //     if (a.cameraX > a.tabla.width/2) {
    //         a.cameraX = a.tabla.width/2
    //     }
    //     if (a.cameraY < -a.tabla.height/2) {
    //         a.cameraY = -a.tabla.height/2
    //     }
    //     if (a.cameraY > a.tabla.height/2) {
    //         a.cameraY = a.tabla.height/2
    //     }
    // }

    public update() {
        if (!this.transformData) {
            return;
        }
        let n = 500
        let now = Date.now();
        for (let node of this.nodes) {
            node.incRotationY(2 * Math.PI / 180 * n / 4000)
            node.updateMatrix()
            n++
        }
        this.updateTransformData()
        let done = Date.now();
        //console.log(`now ${now} done ${done} delta ${done-now}`)

    }

    private initTransformData() {
        let gl = this.gl
        this.transformData = new Float32Array(this.istate.agraphlen * NODE_TRANSFORM_SIZE);
        let n: number = 0;
        for (let node of this.nodes) {
            this.transformData.set(node.color, n);
            n += 4
            this.transformData.set(node.metadata, n);
            n += 4
            this.transformData.set(node.matWorld, n);
            n += 16
        }
        console.log('initTransformData: len ', this.transformData.length)
        this.transformBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.transformBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.transformData, gl.STATIC_DRAW);
    }

    private updateTransformData() {
        let gl = this.gl
        let n: number = 8;
        for (let node of this.nodes) {
            this.transformData.set(node.matWorld, n);
            n += 24
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.transformBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.transformData, gl.STATIC_DRAW);
    }

    public async initialize() {
        console.log('world::initialize, num nodes: ' + this.istate.agraphlen);
        let designation = 0
        for (let inode of this.istate.nodes) {
            let node = new CNode(inode, designation)
            this.nodes.push(node);
            designation++
        }

        let gl = this.gl;


        // Textures
        //
        this.noiseTexture = createRandomTexture(gl, 1024, 1);
        this.worldMapTexture = await loadTexture(gl, "data/Blue_Marble_4K.jpeg");

        // Icosa shader locations
        //
        let positionLoc = gl.getAttribLocation(glShaders[EShader.Icosa], 'a_position');
        const colorLoc = gl.getAttribLocation(glShaders[EShader.Icosa], 'a_color');
        const metadataLoc = gl.getAttribLocation(glShaders[EShader.Icosa], 'a_metadata');
        const modelLoc = gl.getAttribLocation(glShaders[EShader.Icosa], 'a_model');
        const normalLoc = gl.getAttribLocation(glShaders[EShader.Icosa], 'a_normal');
        this.icosaVPLoc = gl.getUniformLocation(glShaders[EShader.Icosa], 'u_viewProjection');
        this.paramsLoc = gl.getUniformLocation(glShaders[EShader.Icosa], 'u_params');
        this.noiseTextureLoc = gl.getUniformLocation(glShaders[EShader.Icosa], 'u_noiseTexture');

        console.log('positionLoc ', positionLoc)
        console.log('modelLoc ', modelLoc)
        console.log('colorLoc ', colorLoc)
        console.log('metadataLoc ', metadataLoc)
        console.log('normalLoc ', normalLoc)

        this.icosaGeometry = initIcosa(gl)
        this.icosaVao = gl.createVertexArray();
        gl.bindVertexArray(this.icosaVao);


        // ATTRIBS 0/1/2/3/5/7 are in the transform data1
        this.initTransformData();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.transformBuffer);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 32);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 48);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 64);
        gl.enableVertexAttribArray(3);
        gl.vertexAttribPointer(3, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 80);
        gl.enableVertexAttribArray(5);
        gl.vertexAttribPointer(5, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 0);
        gl.enableVertexAttribArray(7);
        gl.vertexAttribPointer(7, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 16);

        gl.vertexAttribDivisor(0,1);
        gl.vertexAttribDivisor(1,1);
        gl.vertexAttribDivisor(2,1);
        gl.vertexAttribDivisor(3,1);
        gl.vertexAttribDivisor(5,1);
        gl.vertexAttribDivisor(7,1);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.icosaGeometry);

        // ATTRIBS 4 & 6 are in the vertex data (same for each instance)
        // positions
        gl.enableVertexAttribArray(4);
        gl.vertexAttribPointer(4, 3, gl.FLOAT, false, 24, 0);
        // normals
        gl.enableVertexAttribArray(6);
        gl.vertexAttribPointer(6, 3, gl.FLOAT, false, 24, 12);

        // World Map
        //
        positionLoc = gl.getAttribLocation(glShaders[EShader.WorldMap], 'a_position');
        const uvLoc = gl.getAttribLocation(glShaders[EShader.WorldMap], 'a_uv');
        this.worldMapVPLoc = gl.getUniformLocation(glShaders[EShader.WorldMap], 'u_viewProjection');
        this.worldMapTextureLoc = gl.getUniformLocation(glShaders[EShader.WorldMap], 'u_worldMapTexture');

        console.log('world map positionLoc ', positionLoc)
        console.log('uvLoc ', uvLoc)

        this.worldMapGeometry = initWorldMap(gl)
        this.worldMapVao = gl.createVertexArray();
        gl.bindVertexArray(this.worldMapVao);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldMapGeometry);
        // positions
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
        // uv coords
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
    }


    public renderGl() {
        let elapsed = this.startTime - Date.now()
        this.params[0] = elapsed / 1000.0;
        let gl = this.gl

        // Nodes
        gl.useProgram(glShaders[EShader.Icosa]);
        gl.uniformMatrix4fv(this.icosaVPLoc, false, a.matViewProjection);
        gl.uniform4fv(this.paramsLoc, this.params);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.noiseTexture);
        gl.uniform1i(this.noiseTextureLoc, 0);
        gl.bindVertexArray(this.icosaVao);
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 60, this.istate.agraphlen);

        // World Map
        gl.useProgram(glShaders[EShader.WorldMap]);
        gl.uniformMatrix4fv(this.worldMapVPLoc, false, a.matViewProjection);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.worldMapTexture);
        gl.uniform1i(this.worldMapTextureLoc, 0);
        gl.bindVertexArray(this.worldMapVao);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    public release() {
        // console.log('puzzle release')
        // for ( let group of this.groups ) {
        //     console.log('puzzle release group')
        //     for ( let instance of group.instances ) {
        //         instance.release()
        //         instance = null
        //     }
        //     group.release()
        //     group = null
        // }               
        // this.groups = null 
        // for ( let piece of this.pieces ) {
        //     console.log('puzzle release piece')
        //     piece.release()
        //     piece = null
        // }
        // a.pcamera.release()
        // a.pcamera = null
        // this.pieces = null
        // if (a.gpu) {
        //     console.log('puzzle release gpu')
        //     a.w.topTextureGpu.destroy()
        //     a.w.topTextureGpu = null
        //     if (a.w.normalTextureGpu) {
        //         a.w.normalTextureGpu.destroy()
        //         a.w.normalTextureGpu = null
        //     }
        // }
        // // release gpu resources, etc.
        // if (this.collision) {
        //     this.collision.collisionBuffer = null
        //     this.collision = null
        // }
        // this.ipuzzle = null
        // this.positions = null
        // this.flip = null
        // this.info = null
        // this.backFlip = null
        // this.backInfo = null
        // console.log('puzzle release done')
    }
}

