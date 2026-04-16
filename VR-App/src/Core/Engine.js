import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import ThreeMeshUI from 'three-mesh-ui'
import * as CANNON from 'cannon-es';
import CannonDebuger from 'cannon-es-debugger';
import {Input} from './Input'
import * as ModelLoader from '../ModelLoads.js'
import * as AssetLoader from './TextureObjectLoader.js'
import * as UI from './WorldUI.js';

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
/**
 * @class
 */
class Engine {
    /**
     * @constructor
     */
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

        /** @type {Array<CANNON.Body>} Dead phys bodies to remove after phys tick. */
        this.deadBodies = [];
        /** @type {CANNON.Material} */
        this.standardPhysicsMat;

        // Increase iterations. 50 is a standard baseline for stable stacking in games.
        this.physicsWorld.solver.iterations = 40;

        /** @type {Array<GameObject>} Collection of game objects requiring per-frame updates. */
        this.updatableObjs = [];

        /** @type {Array<WorldUI>} */
        this.updatableUI = [];
                
        /** @type {boolean} Flag to prevent multiple initialization calls. */
        this.initialized = false;

        /** @type {THREE.Timer} High-resolution timer for rendering and physics steps. */
        this.timer = new THREE.Timer();
        
        /** @type {Input} */
        this.input = new Input(this.renderer);

        /** @type {THREE.Group} */
        this.debugGroup = new THREE.Group();
        this.scene.add(this.debugGroup);
        this.debugGroup.visible = false;
        
        /** @type {CannonDebugger} */
        this.cannonDebugger = new CannonDebuger(this.debugGroup, this.physicsWorld);
        
        /** @type {boolean} */
        this.debugEnabled = false;

    }

    /**
     * Appends the renderer to the DOM, enables WebXR, and begins the main execution loop.
     * @returns {Promise<void>}
     */
    async Init() {
        if(this.initialized)
            return;
        this.initialized = true;

        await ModelLoader.LoadAssets();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        document.body.appendChild( VRButton.createButton( this.renderer ) );
        this.renderer.xr.enabled = true;
        
        this.DebugButtonCreate();

        UI.LoadUI();
        //*****************UPDATE LOOP*************************
        this.renderer.setAnimationLoop((time, frame) =>{

            this.OnUpdate(time, frame);
            ThreeMeshUI.update();
            this.OnRender();

        });
        //*****************UPDATE LOOP*************************

        //***************** SKYBOX *********************************
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(AssetLoader.GetPath('clearSky.png'), (texture) => {
            
            texture.mapping = THREE.EquirectangularReflectionMapping;
            this.scene.background = texture;
            this.scene.environment = texture; 
        });
        //**************************************************

        this.camera.position.z = 0;
        this.camera.position.y = 2;

        this.scene.add(new THREE.AmbientLight(0x404040, 2));
        const light = new THREE.PointLight(0xffffff, 100);
        light.position.set(-4, 3, 5);
        light.castShadow = true;

        this.scene.add(light);

        console.log("Engine Initialized");

    }
    

    /**
     * Dispatches the update cycle to all registered objects.
     * @param {number} time - Current execution time (in ms).
     * @param {Object} frame - WebXR frame state data.
     * @returns {void}
     */
    OnUpdate(time, frame) {

        if(this.debugEnabled)
        { 
            this.cannonDebugger.update();
            this.debugGroup.visible = !this.debugGroup.visible;
        }

        this.timer.update(time);

        this.physicsWorld.step(PHY_TIME_STEP, this.timer.getDelta(), MAX_SUB_STEPS);

        //!BODIES MUST BE REMOVED AFTER PHYS TICK
        this.deadBodies.forEach(body => this.physicsWorld.removeBody(body));

        this.updatableObjs.forEach(obj => obj.OnUpdate(time, frame));

        this.updatableUI.forEach(ui => ui.OnUpdate(time));

        
    }

    /**
     * Commands the WebGLRenderer to draw the current scene state to the screen/headset.
     * @returns {void}
     */
    OnRender() {
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Registers a composite game object into the engine's active systems.
     * @param {GameObject} obj - The entity to add. Must expose `.mesh`, `.body`, and `.OnUpdate()`.
     * @returns {void}
     */
    AddObj(obj) {
        this.scene.add(obj.group);
        this.physicsWorld.addBody(obj.body);
        this.updatableObjs.push(obj);
    }


    /**
     * @returns {void}
     */
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
    
    /**
     * Removes Body from Phys engine after physics tick is complete to prevent null errors on CANNON Phys que
     * @param {CANNON.Body} body
     * @returns {void}
     */
    RemoveBody(body)
    {
        if(!this.deadBodies.includes(body))
        {
            this.deadBodies.push(body);
        }
    }
}
export const engine = new Engine();