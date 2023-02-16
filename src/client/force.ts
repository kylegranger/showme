import { showOpenFilePicker } from 'file-system-access'
import ForceGraph3D from '3d-force-graph';
import { IState, INode } from './core';

let Graph: any;

let maxConnections = 0;
let minConnections = 10000;
let minBetweenness = 100;
let maxBetweenness = 0;
let minCloseness = 100;
let maxCloseness = 0;

function updateStats(inode: INode) {
    if (inode.connections.length > maxConnections) {
        maxConnections = inode.connections.length;
    }
    if (inode.connections.length < minConnections) {
        minConnections = inode.connections.length;
    }
    if (inode.betweenness < minBetweenness) {
        minBetweenness = inode.betweenness;
    }
    if (inode.betweenness > maxBetweenness) {
        maxBetweenness = inode.betweenness;
    }
    if (inode.closeness < minCloseness) {
        minCloseness = inode.closeness;
    }
    if (inode.closeness > maxCloseness) {
        maxCloseness = inode.closeness;
    }
}

// r, g, b are normalized values 0..1
function colorString(r: number, g: number, b: number) : string {
    let rstr = Math.floor(r * 255).toString(16);
    if (rstr.length < 2) rstr = '0' + rstr;
    let gstr = Math.floor(g * 255).toString(16);
    if (gstr.length < 2) gstr = '0' + gstr;
    let bstr = Math.floor(b * 255).toString(16);
    if (bstr.length < 2) bstr = '0' + bstr;
    let result = "#" + rstr + gstr + bstr;
    return result;
}

function colorFromNormalizedValue(v: number) : string {
    if (v < 0.25) {
        // blue -> cyan
        v = v * 4;
        return colorString(0, v, 1);
    } else if (v < 0.5) {
        // cyan -> green
        v = (v-0.25) * 4;
        return colorString(0, 1, 1-v);
    } else if (v < 0.75) {
        // green -> yellow
        v = (v-0.50) * 4;
        return colorString(v, 1, 0);
    } else {
        // yellow -> red
        v = (v-0.75) * 4;
        return colorString(1, 1-v, 0);
    }
}

function onKeydownEvent(evt: KeyboardEvent) {
    console.log('onKeyDownEvent: ', evt.code);
    if (evt.code == 'KeyC') {
        console.log('colormode cycle!');
        Graph.nodeColor(Graph.nodeColor())
    }
}

export async function loadForceState() {
    window.addEventListener('keydown', (evt) => {
        onKeydownEvent(evt);
    });
    let fileHandle : FileSystemFileHandle;
    try {
        if (window.showOpenFilePicker) {
            console.log('Using native window.showOpenFilePicker');
            [fileHandle] = await window.showOpenFilePicker();
        } else {
            console.log('Using polyfile version of showOpenFilePicker');
            [fileHandle] = await showOpenFilePicker();
        }
    } catch (err) {
        console.log(err);
        console.log('User cancelled request, or problem loading file.  Gracefully exiting loadState');
        return;
    }
    fileHandle.getFile().then( async (file) => {
        const contents = await file.text();
        handleStateText(contents);
    });
}


// function randomColorString() : string {
//     let r = Math.floor(Math.random() * 256);
//     let g = Math.floor(Math.random() * 256);
//     let b = Math.floor(Math.random() * 256);
//     // if (rstr.length < 2) rstr = '0' + rstr;
//     // let gstr = Math.floor(Math.random() * 256).toString(16);
//     // if (gstr.length < 2) gstr = '0' + gstr;
//     // let bstr = Math.floor(Math.random() * 256).toString(16);
//     // if (bstr.length < 2) bstr = '0' + bstr;
//     // let result = "#" + rstr + gstr + bstr;
//     return colorString(r, g, b);
// }

function handleStateText(text: string) {
    let istate : IState = JSON.parse(text);
    // console.log('random color: ', randomColorString());
    // console.log('random color: ', randomColorString());
    // console.log('random color: ', randomColorString());
    // console.log('random color: ', randomColorString());
    // console.log('random color: ', randomColorString());
    // console.log('random color: ', randomColorString());
    console.log('my istate: ', istate);
    const N = 300;
    let nodes = new Array();
    let links = new Array();
    let i = 0;
    for (let node of istate.nodes) {
        updateStats(node);
    }
    for (let node of istate.nodes) {
        let id = 'id' + i.toString();
        let name = 'name' + i.toString();
        // let group = (Math.floor(node.geolocation.longitude/10) + 18).toString();
        let ip = node.ip;
        let city = node.geolocation.city;

        let b = (node.betweenness - minBetweenness) / (maxBetweenness - minBetweenness);
        let betweenColor = colorFromNormalizedValue(b);

        let c =  (node.closeness - minCloseness) / (maxCloseness - minCloseness);
        let closeColor = colorFromNormalizedValue(c);

        let d =  (node.connections.length - minConnections) / (maxConnections - minConnections);
        let degreeColor = colorFromNormalizedValue(d);


        nodes.push({id, name, ip, city, degreeColor});
        for (let connection of node.connections) {
            let cid = 'id' + connection.toString();
            let link = {
                source: id,
                target: cid
            }
            links.push(link);
        }
        i++;
    }
    const Data = {
        nodes, links
    }

    console.log('Data: ', Data);
    Graph = ForceGraph3D()
    (document.getElementById('graph'))
        .linkVisibility(false)
        .nodeColor(node => node['degreeColor'])
        // .nodeAutoColorBy('group')
        .nodeLabel(node => `${node['name']}: ${node['ip']} ${node['city']}`)
        .graphData(Data);
   

    Graph.onNodeClick(node => {
        Graph.linkVisibility((link) => {
            return link.source['name'] == node['name'];})
           });

}

var clickforce = document.getElementById("clickforce");
if (clickforce) clickforce.addEventListener("click", loadForceState, false);