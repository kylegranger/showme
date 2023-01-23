
import { vec3, mat4 } from 'gl-matrix'
// import { CWebGl } from "./webgl"
import { PCamera } from "camera"
import { CWorld } from './world'


export interface IGlobalInfo {
    // gl2: CWebGl
    world: CWorld
    canvas: HTMLCanvasElement
    pcamera: PCamera
    cameraX: number
    cameraY: number
    cameraZ: number
    worldWidth: number
    worldHeight: number
    gl: WebGL2RenderingContext
    matView: mat4
    matViewProjection: mat4
    matProjection: mat4
    timeNode: Text,
    fpsNode: Text
}

export let a : IGlobalInfo= {
    // gl2: null,
    canvas: null,
    pcamera: null,
    cameraX: 0,
    cameraY: 0,
    cameraZ: 0,
    worldWidth: 0,
    worldHeight: 0,
    gl: null,
    matView: null,
    matProjection: null,
    matViewProjection: null,
    world: null,
    timeNode: null,
    fpsNode: null
} 

