import * as THREE from 'three';
import * as CANNON from 'cannon-es'
import {Engine} from './Core/Engine.js'
import { GameObject } from './Core/GameObject.js';
const engine = new Engine();
engine.Init();

//create cube

class Cube extends GameObject{
    
    constructor()
    {
        
        const geo = new THREE.BoxGeometry(1,1,1,1);
        const mat = new THREE.MeshLambertMaterial({color: 0x00ff00});
        const mesh = new THREE.Mesh(geo, mat);

        const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
        const body = new CANNON.Body({
            mass: 1, // > 0 means dynamic (affected by gravity)
            shape: shape,
            position: new CANNON.Vec3(0, 5, 0) // Start 5 units in the air
        });

        super(mesh,body);
    }

    OnUpdate()
    {
        super.OnUpdate();

        this.body.angularVelocity.set(1,1,0);
        if(this.body.position.y < -3)
        { 
            this.body.position.y = 10;
            this.body.velocity.setZero();
        }
    }
}

const cube = new Cube();

engine.AddObj(cube);
engine.camera.position.z = 5;

engine.scene.background = new THREE.Color(0x1a1a2e);
engine.scene.add(new THREE.AmbientLight(0x404040, 2));
const light = new THREE.PointLight(0xffffff, 100);
light.position.set(0, 5, 5);
light.castShadow = true;

light.shadow.camera.left = -20;
light.shadow.camera.right = 20;
light.shadow.camera.top = 20;
light.shadow.camera.bottom = -20;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 50;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;

engine.scene.add(light);