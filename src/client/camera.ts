import { a } from './globals'
import { mat4, vec3 } from 'gl-matrix'

export class PCamera {
    private near: number
    private far: number
    private fovx: number
    private canvas: HTMLCanvasElement
    public x: number
    public y: number
    public z: number
    public constructor(x: number, y: number, z: number, canvas: HTMLCanvasElement) {
        this.near = 16
        this.far = 4096
        this.x = x
        this.y = y
        this.z = z
        this.fovx = 60 * Math.PI / 180
        this.canvas = canvas
        this.update()
    }

    public release() {
    }

    public update() : void {
        let aspect = this.canvas.width / this.canvas.height
        a.worldWidth = this.z * 1 / 0.886
        a.worldHeight = a.worldWidth / aspect
        mat4.perspective(a.matProjection, this.fovx / aspect, aspect, this.near, this.far)
        let rx = mat4.create()
        mat4.fromXRotation(rx, 0)
        let matWorld = mat4.create()
        mat4.translate(matWorld, matWorld, vec3.fromValues(this.x, this.y, this.z))
        mat4.multiply(matWorld, matWorld, rx)
        mat4.invert(a.matView, matWorld)
        mat4.multiply(a.matViewProjection, a.matProjection, a.matView)
    }
}   