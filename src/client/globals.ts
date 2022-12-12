
import { vec3, mat4 } from 'gl-matrix'
import { CWebGl } from "./webgl"
import { PCamera } from "camera"
import { CTabla } from './tabla'


export interface IGlobalInfo {
    gl2: CWebGl
    canvas: HTMLCanvasElement

    tabla: CTabla

    panMillis: number
    panCoeff: number
    panCoeffX: number
    panCoeffY: number

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
    matNormal: mat4
    lightDirection: vec3
    updateMc: boolean
}

export let a : IGlobalInfo= {
    gl2: null,

    canvas: null,
    tabla: null,

    panMillis: 500,
    panCoeff: 0.25,
    panCoeffX: 0,
    panCoeffY: 0,

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
    matNormal: null,
    lightDirection: null,
    updateMc: false,
} 

