
import { EKeyId, IKeyAction } from './core'
import { a } from './globals';
import { PCamera } from './camera';
import { zoomLogToScale } from './util'

export class CShowme {
    public  gl: WebGL2RenderingContext
    public actions: IKeyAction []
    private velPanX: number
    private velPanY: number
    private velZoom: number
    private zoomLogarithm: number
    private lastUpdateTime: number
    public mouseIsOut: boolean
    public camera: PCamera
    private canvas: HTMLCanvasElement

    public constructor(canvas: HTMLCanvasElement, camera: PCamera) {
        this.actions = new Array();
        this.canvas = canvas;
        this.camera = camera;
        this.lastUpdateTime = Date.now();
        this.velPanX = 0;
        this.velPanY = 0;
        this.velZoom = 0;
        this.mouseIsOut = true;
    }
    

    onAction(isDown: boolean, id: EKeyId) {
        if (isDown) {
            if (id == EKeyId.ToggleConnection && a.world) {
                a.world.connectionMode = !a.world.connectionMode;
            }
            if (id == EKeyId.ColorMode && a.world) {
                a.world.cycleColorMode();
            }
            let action: IKeyAction = {
                id: id,
                timestamp: Date.now(),
                acceleration: 0,
                velocity: 0
            };
            this.actions.push(action);
        } else {
            this.actions = this.actions.filter(function(action, index, arr){ 
                return action.id != id;
            });
        }
    }

    public handleClickRelease(x: number, y: number) {
    }

    public handleClick(x: number, y: number) {
        // console.log(`showme: handleClick: ${x}, ${y}`)
        a.world.handleClick(x-0.5, y-0.5)

    }

    private updateActions(delta: number) {
        // reach maximum velocity in 200 ms
        const ACC = 2.5;
        const MAXVEL = 0.5;
        let accelX: number = 0;
        let accelY: number = 0;
        let accelZ: number = 0;
        if (this.actions.length) {
            for (let action of this.actions) {
                switch (action.id) {
                    case EKeyId.ArrowLeft:
                        accelX = -ACC * delta / 1500;
                        this.velPanX += accelX;
                        if (this.velPanX < -MAXVEL) {
                            this.velPanX = -MAXVEL;
                        }
                        break
                    case EKeyId.ArrowRight:
                        accelX = ACC * delta / 1500;
                        this.velPanX += accelX;
                        if (this.velPanX > MAXVEL) {
                            this.velPanX = MAXVEL;
                        }
                        break
                    case EKeyId.ArrowDown:
                        accelY = ACC * delta / 1500;
                        this.velPanY += accelY;
                        if (this.velPanY > MAXVEL) {
                            this.velPanY = MAXVEL;
                        }
                        break
                    case EKeyId.ArrowUp:
                        console.log('key up');
                        accelY = -ACC * delta / 1500;
                        this.velPanY += accelY;
                        if (this.velPanY < -MAXVEL) {
                            this.velPanY = -MAXVEL;
                        }
                        break
                    case EKeyId.ZoomIn:
                        accelZ = -ACC * delta / 1000;
                        this.velZoom += accelZ;
                        if (this.velZoom < -MAXVEL) {
                            this.velZoom = -MAXVEL;
                        }
                        break
                    case EKeyId.ZoomOut:
                        accelZ = ACC * delta / 1000;
                        this.velZoom += accelZ;
                        if (this.velZoom > MAXVEL) {
                            this.velZoom = MAXVEL;
                        }
                        break
                }
            }
        }

        // if no acceleration, apply deacceleration to any current velocities
        if (accelX == 0 && this.velPanX != 0) {
            //console.log('do deacceleration')
            accelX = ACC * 2 * delta / 1000;
            if (this.velPanX > 0) {
                this.velPanX -= accelX;
                if (this.velPanX < 0) {
                    this.velPanX = 0;
                } 
            } else {
                this.velPanX += accelX;
                if (this.velPanX > 0) {
                    this.velPanX = 0;
                } 
            }
        }

        if (accelY == 0 && this.velPanY != 0) {
            console.log('have acc Y');
            accelY = ACC * 2 * delta / 1000;
            if (this.velPanY > 0) {
                this.velPanY -= accelY;
                if (this.velPanY < 0) {
                    this.velPanY = 0;
                } 
            } else {
                this.velPanY += accelY;
                if (this.velPanY > 0) {
                    this.velPanY = 0;
                } 
            }
        } 

        if (accelZ == 0 && this.velZoom != 0) {
            accelZ = ACC * 2 * delta / 1000;
            if (this.velZoom > 0) {
                this.velZoom -= accelZ;
                if (this.velZoom < 0) {
                    this.velZoom = 0;
                } 
            } else {
                this.velZoom += accelZ;
                if (this.velZoom > 0) {
                    this.velZoom = 0;
                } 
            }
        }

        // apply pan velocity
        if (this.velPanX || this.velPanY) {
            let dimen : number = (this.camera.worldWidth > this.camera.worldHeight) ? this.camera.worldWidth : this.camera.worldHeight;
            let dx = this.velPanX * delta / 1000 * dimen;
            let dy = this.velPanY * delta / 1000 * dimen;
            this.camera.x += dx;
            this.camera.y -= dy;
            this.camera.update()
        }

        // apply zoom velocity
        if (this.velZoom) {
            let dz = this.velZoom * delta / 1000
            this.zoomLogarithm += dz
            if (this.zoomLogarithm > 8.14786) {
                this.zoomLogarithm = 8.14786;
                this.velZoom = 0;
            }
            if (this.zoomLogarithm < 3.158883) {
                this.zoomLogarithm = 3.158883;
                this.velZoom = 0;
            }
            a.nodeScale = zoomLogToScale(this.zoomLogarithm);
            this.camera.z = Math.exp(this.zoomLogarithm)
            // console.log(`Z ${a.cameraZ}, log ${this.zoomLogarithm}`)
            this.camera.update()
        }
    }

    public update() {
        let time = Date.now()
        let delta = time - this.lastUpdateTime
        this.lastUpdateTime = time
        this.updateActions(delta)
        this.camera.update()
        a.world.update()
    }

    public async initialize(gl: WebGL2RenderingContext) {
        this.zoomLogarithm = Math.log(1200);
        a.nodeScale = zoomLogToScale(this.zoomLogarithm);
        this.camera.update();
        await this.initializeGl(gl);
    }

    async initializeGl(gl: WebGL2RenderingContext) {
        this.gl = gl;
    }

    public renderGl() {
        this.update();
        if (a.world) {
            a.world.renderGl();
        }
    }

    public release() {
    }
}

