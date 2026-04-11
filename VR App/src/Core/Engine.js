import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as CANNON from 'cannon-es';
import CannonDebuger from 'cannon-es-debugger';
import {Input} from './Input'
import * as AssetLoader from '../ModelLoads.js'

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
        this.standardPhysicsMat;

        /** @type {Array<Object>} Collection of game objects requiring per-frame updates. */
        this.updatableObjs = [];
        
        /** @type {boolean} Flag to prevent multiple initialization calls. */
        this.initialized = false;

        /** @type {THREE.Timer} High-resolution timer for rendering and physics steps. */
        this.timer = new THREE.Timer();

        this.input = new Input(this.renderer);

        this.debugEnabled = false;

        
    }

    /**
     * Appends the renderer to the DOM, enables WebXR, and begins the main execution loop.
     */
    async Init() {
        if(this.initialized)
            return;
        this.initialized = true;

        await AssetLoader.LoadAssets();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        document.body.appendChild( VRButton.createButton( this.renderer ) );
        this.renderer.xr.enabled = true;
        
        this.DebugButtonCreate();
        const debugGroup = new THREE.Group();
        debugGroup.visible = false;
        this.scene.add(debugGroup);
        const cannonDebugger = CannonDebuger(debugGroup, this.physicsWorld);

        this.renderer.setAnimationLoop((time, frame) =>{
            this.timer.update(time);

            this.physicsWorld.step(PHY_TIME_STEP, this.timer.getDelta(), MAX_SUB_STEPS);
            if(this.debugEnabled)
            { 
                cannonDebugger.update();
                debugGroup.visible = !debugGroup.visible;
            }

            this.OnUpdate(time, frame);
            this.OnRender();

        });

        const textureLoader = new THREE.TextureLoader();
        textureLoader.load('../../public/clearSky.png', (texture) => {
            
            // Tell Three.js to wrap this image in a sphere around the camera
            texture.mapping = THREE.EquirectangularReflectionMapping;
            
            // Set it as the visual background
            this.scene.background = texture;
            
            // PRO-TIP: Set it as the environment to make shiny objects reflect the sky!
            this.scene.environment = texture; 
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
        this.scene.add(obj.group);
        this.physicsWorld.addBody(obj.body);
        this.updatableObjs.push(obj);
    }


    DebugButtonCreate()
    {
        // 1. Create the button element
        const debugBtn = document.createElement('button');
        debugBtn.innerText = "Toggle Physics Debug WireFrame";

        // 2. Apply CSS styling for absolute positioning
        debugBtn.style.position = 'absolute';
        debugBtn.style.top = '20px';
        debugBtn.style.left = '20px';
        debugBtn.style.zIndex = '999'; // Forces button to render over the WebGL canvas
        debugBtn.style.padding = '10px 20px';
        debugBtn.style.cursor = 'pointer';

        // 3. Append to the document body
        document.body.appendChild(debugBtn);

        // 4. Bind the click event
        debugBtn.addEventListener('click', () => {
            this.debugEnabled = !this.debugEnabled;
        });
    }
}
export const engine = new Engine();