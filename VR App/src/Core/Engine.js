import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';

const FOV = 75;
const N_PLANE = 0.1;
const F_PLANE = 1000;
export class Engine {
    constructor() {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer();
        this.camera = new THREE.PerspectiveCamera(FOV, window.innerWidth/window.innerHeight, N_PLANE, F_PLANE);

        this.updatableObjs = [];
        this.initialized = false;

        this.timer = new THREE.Timer();
    }

    Init() 
    {
        if(this.initialized)
            return;
        this.initialized = true;

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        document.body.appendChild( VRButton.createButton( this.renderer ) );
        this.renderer.xr.enabled = true;

        this.renderer.setAnimationLoop((time, frame) =>{
            this.timer.update(time);
            this.Update(time, frame);
            this.Render();    
        })
        console.log("Engine Initialized");
    }

    Update(time, frame)
    {
        this.updatableObjs.forEach(obj => obj.Update(time, frame));
    }

    Render()
    {

    }
    Test()
    {

    }
}