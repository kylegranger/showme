
import { CApp } from './app'

let app : CApp;
let fileHandle: FileSystemFileHandle;
async function main() {
    [fileHandle] = await window.showOpenFilePicker();

    app = new CApp(document.querySelector("#bancan"), fileHandle)
    window['showmeapp'] = app;
}

document.getElementById("instructions").style.visibility = 'hidden';
document.getElementById("overlayLeft").style.visibility = 'hidden';
document.getElementById("overlayRight").style.visibility = 'hidden';
document.getElementById("gradient").style.visibility = 'hidden';

var clickme = document.getElementById("clickme");
clickme.addEventListener("click", loadState, false);

async function loadState() {
    console.log('got click')


    window.removeEventListener('mousedown', loadState, false);
    let fileHandle: FileSystemFileHandle;
    [fileHandle] = await window.showOpenFilePicker();

    console.log('fileHandle: ', fileHandle);
    var elem = document.getElementById('clickme');
    elem.parentNode.removeChild(elem);
    document.getElementById("instructions").style.visibility = 'visible';
    document.getElementById("overlayLeft").style.visibility = 'visible';
    document.getElementById("gradient").style.visibility = 'visible';


    app = new CApp(document.querySelector("#bancan"), fileHandle)
    window['showmeapp'] = app;

    // fileHandle.getFile().then( async (file) => {
    //     const contents = await file.text();
    //     handleStateText(contents);
    // });
    // clickme

    // app = new CApp(document.querySelector("#bancan"), fileHandle)
    // window['showmeapp'] = app;
    
    // evt.preventDefault();
}


// // main();
// async function loadState(evt: MouseEvent) {
//     console.log('got click')

//     window.removeEventListener('mousedown', loadState, false);
//     let fileHandle: FileSystemFileHandle;
//     [fileHandle] = await window.showOpenFilePicker();

//     app = new CApp(document.querySelector("#bancan"), fileHandle)
//     window['showmeapp'] = app;
    
//     evt.preventDefault();
// }

// window.addEventListener('mousedown', loadState, false);

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {

    var canvas: HTMLCanvasElement = document.querySelector("#bancan");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const bounds = canvas.getBoundingClientRect();
    if (app.gl) {
        app.gl.viewport(0,0,bounds.width,bounds.height)
    }
    if (app.camera) {
        app.camera.update();
    }
}

window.addEventListener('contextmenu', function (e) { 
    e.preventDefault();
}, false);

var animate = function () {
    if (app) app.render();
    requestAnimationFrame(animate);
};

animate();
