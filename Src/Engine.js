import * as THREE from 'three';
import { VRButton } from '../Vendor/ThreeJS/VRButton.js';

export class Engine
{
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        
        this.updatables = [];
        this.init();
    }

    init()
    {

    }

    add(obj)
    {
        
    }

    
}