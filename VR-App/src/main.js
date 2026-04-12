import * as THREE from 'three';
import * as CANNON from 'cannon-es'
import {engine} from './Core/Engine.js'
import { GameObject } from './Core/GameObject.js';
import * as AssetLoader from './Core/TextureObjectLoader.js';
import * as Objects from './Objects/Objects.js'





await engine.Init();
Objects.LoadGame();

const projectile = new Objects.Projectile();


// const target = new Objects.Target();
// target.body.position.set(-2,1,-1);

class Head extends GameObject
{
    constructor()
    {
        const headPos = new THREE.Vector3();
        const cam = engine.renderer.xr.getCamera();
        cam.getWorldPosition(headPos);

        const cHeadPos  = new CANNON.Vec3(headPos.x,headPos.y, headPos.z);
        const headShape = new CANNON.Sphere(0.15);
        const body = new CANNON.Body(
            {
                mass: 0, 
                type: CANNON.Body.KINEMATIC, // Tells Cannon "I will move this manually, ignore gravity"
                shape: headShape,
                position: cHeadPos
            });
            engine.physicsWorld.addBody(body);       
        super(undefined, body);
    }
    OnUpdate()
    {
        super.OnUpdate();
        const headPos = new THREE.Vector3();
        const cam = engine.renderer.xr.getCamera();
        cam.getWorldPosition(headPos);

        const cHeadPos  = new CANNON.Vec3(headPos.x,headPos.y, headPos.z);
        this.body.position.copy(cHeadPos);
    }
}

const head = new Head();
projectile.MakeTarget(head);



