import { CShowme } from './showme'
import { a } from './globals'
import { mat4, vec3 } from 'gl-matrix'
import { initShadersGl } from './shaders'
import { IState } from './core'
import { CMousekeyCtlr } from './mousekeyctlr'
import { CWorld } from './world'
import { PCamera } from './camera'

export class CApp {
    public showme: CShowme;
    private mousekey: CMousekeyCtlr
    private initialized: boolean;
    private startTime: number;
    private lastTime: number;
    private iter: number;
    public gl: WebGL2RenderingContext;
    private canvas: HTMLCanvasElement
    private camera: PCamera;


public constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    console.log('Use WebGL')
    this.gl = canvas.getContext("webgl2");
    if (!this.gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Create text nodes to save some time for the browser.
    a.timeNode = document.createTextNode("");
    a.fpsNode = document.createTextNode("");
    a.ipNode = document.createTextNode("");
    a.betweennessNode = document.createTextNode("");
    a.closenessNode = document.createTextNode("");
    a.connectionsNode = document.createTextNode("");
    a.latitudeNode = document.createTextNode("");
    a.longitudeNode = document.createTextNode("");
    a.positionNode = document.createTextNode("");
    a.heightNode = document.createTextNode("");
    a.cityNode = document.createTextNode("");
    a.countryNode = document.createTextNode("");
    a.colorModeNode = document.createTextNode("");

    a.colorModeNode.nodeValue = 'random'

    // Add those text nodes where they need to go
    document.querySelector("#time").appendChild(a.timeNode);
    document.querySelector("#fps").appendChild(a.fpsNode);
    document.querySelector("#ip").appendChild(a.ipNode);
    document.querySelector("#betweenness").appendChild(a.betweennessNode);
    document.querySelector("#closeness").appendChild(a.closenessNode);
    document.querySelector("#connections").appendChild(a.connectionsNode);
    document.querySelector("#latitude").appendChild(a.latitudeNode);
    document.querySelector("#longitude").appendChild(a.longitudeNode);
    document.querySelector("#position").appendChild(a.positionNode);
    document.querySelector("#height").appendChild(a.heightNode);
    document.querySelector("#city").appendChild(a.cityNode);
    document.querySelector("#country").appendChild(a.countryNode);
    document.querySelector("#colormode").appendChild(a.colorModeNode);
    document.getElementById("overlayRight").style.visibility = "hidden";

    let self = this
    self.readTextFile('data/state.json', async function(atext: string) {
        let istate = <IState>JSON.parse(atext)
            await self.init(istate)
    });
    this.startTime = Date.now()/1000
    this.lastTime = 0
    this.iter = 0
}

async init(state: IState) {
    console.log('init: state ', state)

    this.camera = new PCamera(0, 0, 1200, this.canvas)

    a.nodeScale = vec3.fromValues(1, 1, 1)
    this.initializeWebGl(this.gl)
    a.world = new CWorld(state, this.gl, this.canvas, this.camera);
    a.world.initialize();
    this.initialized = true
    this.mousekey = new CMousekeyCtlr(this)

    let temp = new CShowme(this.canvas, this.camera)
    await temp.initialize(this.gl)
    this.showme = temp



}

async initializeWebGl(gl: WebGL2RenderingContext) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.clearDepth(1.0)
        gl.clearStencil(0.0)
        gl.enable(gl.DEPTH_TEST)
        gl.frontFace(gl.CW)
        gl.cullFace(gl.BACK)
        gl.enable(gl.CULL_FACE)
        gl.lineWidth(4.0);
        initShadersGl(gl)
    }

    private updateFps() {
        this.iter++
        if (this.iter % 15 == 0) {
            let now = Date.now()
            let delta = now - this.lastTime
            this.lastTime = now
            let fps = 1000*15/delta;
            a.fpsNode.nodeValue = fps.toFixed(6);
        }
    }

    public renderGl() {
        this.updateFps();
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        a.timeNode.nodeValue = (Date.now()/1000 - this.startTime).toFixed(2);   // 2 decimal places        
        if (this.showme) {
            this.showme.renderGl()
        }
    }

    public render() {
        if (!this.initialized) {
            return
        }
        if (this.gl) {
            this.renderGl()
        }
    }

    // async initShowme() {
    //     let temp = new CShowme(this.canvas)
    //     await temp.initialize(this.gl)
    //     this.showme = temp
    // }

    readTextFile(file, callback) {
        var rawFile = new XMLHttpRequest();
        rawFile.overrideMimeType("application/json");
        rawFile.open("GET", file, true);
        rawFile.onreadystatechange = function() {
            if (rawFile.readyState == 4 && rawFile.status == 200) {
                callback(rawFile.responseText);
            }
        }
        rawFile.send(null);
    }
}

