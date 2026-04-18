import * as THREE from 'three';
import { engine } from "./Engine";

class AudioManager
{
    constructor()
    {
        this.soundLibrary = {};

        this.cam = engine.renderer.xr.getCamera();
        
        this.audioListener = new THREE.AudioListener();

        this.cam.add(this.audioListener);
    }
}
export const audioManager = new AudioManager();