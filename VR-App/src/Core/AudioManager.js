import * as THREE from 'three';
import { engine } from "./Engine";


class AudioManager
{
    constructor()
    {
        this.soundLibrary = {};
        this.audioListener = new THREE.AudioListener();

        this.cam = null;
    }

    //need an init to  wait on the engine
    Init()
    {
        this.cam = engine.renderer.xr.getCamera();
        this.cam.add(this.audioListener); 

    }
}


export const audioManager = new AudioManager();

