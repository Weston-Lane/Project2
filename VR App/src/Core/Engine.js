import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as CANNON from 'cannon-es';

const FOV = 75;
const N_PLANE = 0.1;
const F_PLANE = 1000;

const PHY_TIME_STEP = 1/60;
const MAX_SUB_STEPS = 3;
const GRAVITY = -9.82;

/**
 * Core application engine managing the Three.js WebGL renderer, WebXR loop, 
 * and Cannon-es physics simulation.
 */
export class Engine {
    constructor() {
        /** @type {THREE.Scene} The main visual scene graph. */
        this.scene = new THREE.Scene();
        
        /** @type {THREE.WebGLRenderer} The WebGL graphics renderer. */
        this.renderer = new THREE.WebGLRenderer();
        
        /** @type {THREE.PerspectiveCamera} The primary point of view. */
        this.camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, N_PLANE, F_PLANE);

        /** @type {CANNON.World} The physics simulation environment. */
        this.physicsWorld = new CANNON.World({
            gravity: new CANNON.Vec3(0, GRAVITY, 0),
        });

        /** @type {Array<Object>} Collection of game objects requiring per-frame updates. */
        this.updatableObjs = [];
        
        /** @type {boolean} Flag to prevent multiple initialization calls. */
        this.initialized = false;

        /** @type {THREE.Timer} High-resolution timer for rendering and physics steps. */
        this.timer = new THREE.Timer();
    }

    /**
     * Appends the renderer to the DOM, enables WebXR, and begins the main execution loop.
     */
    Init() {
        if(this.initialized)
            return;
        this.initialized = true;

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        document.body.appendChild( VRButton.createButton( this.renderer ) );
        this.renderer.xr.enabled = true;

        this.renderer.setAnimationLoop((time, frame) =>{
            this.timer.update(time);

            this.OnUpdate(time, frame);
            this.OnRender();

            this.physicsWorld.step(PHY_TIME_STEP, this.timer.getDelta(), MAX_SUB_STEPS);
        });

        console.log("Engine Initialized");
    }

    /**
     * Dispatches the update cycle to all registered objects.
     * @param {number} time - Current execution time (in ms).
     * @param {Object} frame - WebXR frame state data.
     */
    OnUpdate(time, frame) {
        this.updatableObjs.forEach(obj => obj.OnUpdate(time, frame));
    }

    /**
     * Commands the WebGLRenderer to draw the current scene state to the screen/headset.
     */
    OnRender() {
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Registers a composite game object into the engine's active systems.
     * @param {Object} obj - The entity to add. Must expose `.mesh`, `.body`, and `.OnUpdate()`.
     */
    AddObj(obj) {
        this.scene.add(obj.mesh);
        this.physicsWorld.addBody(obj.body);
        this.updatableObjs.push(obj);
    }
}