
import { mat4, vec3 } from 'gl-matrix'
import { PCamera } from "camera"
import { CWorld } from './world'


export interface IGlobalInfo {
    nodeScale: vec3
    timeNode: Text,
    fpsNode: Text,
    ipNode: Text,
    betweennessNode: Text,
    closenessNode: Text,
    connectionsNode: Text,
    latitudeNode: Text,
    longitudeNode: Text,
    cityNode: Text,
    countryNode: Text,
    positionNode: Text,
    heightNode: Text
    colorModeNode: Text,
}

export let a : IGlobalInfo= {
    nodeScale: null,
    timeNode: null,
    fpsNode: null,
    latitudeNode: null,
    longitudeNode: null,
    cityNode: null,
    countryNode: null,
    ipNode: null,
    betweennessNode: null,
    closenessNode: null,
    connectionsNode: null,
    positionNode: null,
    heightNode: null,
    colorModeNode: null
} 

