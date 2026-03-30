import * as THREE from 'three';
import * as CANNON from 'cannon-es'
import {engine} from './Core/Engine.js'
import { GameObject } from './Core/GameObject.js';
import * as AssetLoader from './Core/TextureObjectLoader.js';

class Cube extends GameObject{
    
    constructor()
    {

        const geo = new THREE.BoxGeometry(1,1,1,1);
        const mat = new THREE.MeshLambertMaterial({color: 0x0000ff});
        const mesh = new THREE.Mesh(geo, mat);

        const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
        const body = new CANNON.Body({
            mass: 1, // > 0 means dynamic (affected by gravity)
            shape: shape,
            position: new CANNON.Vec3(-1, 5, -1) // Start 5 units in the air
        });

        super(mesh, body);
        
        this.targetObj = null;
        this.moveSpeed = 1;
    }

    OnUpdate()
    {
        super.OnUpdate();

        this.body.angularVelocity.set(1,1,0);
        if(this.body.position.y < -3)
        { 
            this.body.position.y = 5
            this.body.velocity.setZero();
        }
        
        if(this.targetObj)
        {
            const targetPos = this.targetObj.body.position;
            const currPos = this.body.position;

            const dirVec = new CANNON.Vec3();
            targetPos.vsub(currPos, dirVec);

            dirVec.normalize();

            dirVec.scale(this.moveSpeed, dirVec);

            this.body.applyForce(dirVec, this.body.position);
        }

    }
    /**
     * @param {GameObject} obj 
     */
    AddTarget(obj)
    {
        this.targetObj = obj;
        
    }

    OnCollision(event)
    {
        super.OnCollision(event);
        
    }
}

class Hand extends GameObject
{
    constructor()
    {
        const geo = new THREE.BoxGeometry(0.1,0.1,0.2);
        const mat = new THREE.MeshLambertMaterial({color: 0x00ff00});
        const mesh = new THREE.Mesh(geo, mat);

        const shape = new CANNON.Box(new CANNON.Vec3(0.1,0.05,0.1));
        const body = new CANNON.Body({
            mass: 0,
            type: CANNON.Body.KINEMATIC,
            shape: shape,
            material: new CANNON.ContactMaterial()
        });
        super(mesh,body);

        this.targetPos;
    }

    OnUpdate()
    {
        super.OnUpdate();

        const controller = engine.input.GetController(0);

        this.body.position.copy(controller.position);
        this.body.quaternion.copy(controller.quaternion);
        
    }


}

class Car extends GameObject
{
    constructor()
    {
            
        const mesh = AssetLoader.AssetCache.models['vehicle'].clone();
        super(mesh, undefined);
    }

    OnUpdate()
    {
        super.OnUpdate();

        this.body.angularVelocity.set(1,1,0);
        if(this.body.position.y < -3)
        { 
            this.body.position = new CANNON.Vec3(-2,5,-3);
            this.body.velocity.setZero();
        }
    }
}

class Pipe extends GameObject
{
    constructor()
    {
            
        const mesh = AssetLoader.AssetCache.models['pipe'].clone();

        const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
        const body = new CANNON.Body({
            mass: 1, // > 0 means dynamic (affected by gravity)
            shape: shape,
            position: new CANNON.Vec3(-1, 10, -1) // Start 5 units in the air
        });

        super(mesh, body);
        
    }

    OnUpdate()
    {
        super.OnUpdate();

        this.body.angularVelocity.set(1,1,0);
        if(this.body.position.y < -3)
        { 
            this.body.position.y = 5
            this.body.velocity.setZero();
        }
    }
}


await engine.Init();
//const cube = new Cube();
const car = new Car();
const hand = new Hand();
new Pipe();
//cube.AddTarget(hand);
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