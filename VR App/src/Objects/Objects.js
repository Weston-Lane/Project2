import * as THREE from 'three';
import * as CANNON from 'cannon-es'
import {engine} from '../Core/Engine.js'
import { GameObject } from '../Core/GameObject.js';
import * as AssetLoader from '../Core/TextureObjectLoader.js';


export class Cube extends GameObject{
    
    constructor()
    {

        const geo = new THREE.BoxGeometry(1,1,1,1);
        const mat = new THREE.MeshLambertMaterial({color: 0x0000ff});
        const mesh = new THREE.Mesh(geo, mat);

        const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
        const body = new CANNON.Body({
            mass: 1, // > 0 means dynamic (affected by gravity)
            shape: shape,
            position: new CANNON.Vec3(-1, 5, -1), // Start 5 units in the air
            
        });

        super(mesh, body);
        
        this.targetObj = null;
        this.moveSpeed = 1;
    }

    OnUpdate()
    {
        super.OnUpdate();

        
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

export class Plane extends GameObject
{
    constructor()
    {
        const geo = new THREE.PlaneGeometry(50,50);
        const mat = new THREE.MeshLambertMaterial({color: 0x0000af});
        const mesh = new THREE.Mesh(geo, mat);

        const shape = new CANNON.Plane();
        const body = new CANNON.Body({
            type: CANNON.BODY_TYPES.STATIC,
            shape: shape,
            position: new CANNON.Vec3(0, 0, 0), 
            material: engine.genericMaterial
        });

        body.quaternion.setFromEuler(-Math.PI/2,0,0); //rotate to xz plane
        super(mesh,body);

    }
}

export class Hand extends GameObject
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

export class Car extends GameObject
{
    constructor()
    {
            
        const mesh = AssetLoader.AssetCache.models['vehicle'].clone();
        super(mesh, undefined);
    }

    OnUpdate()
    {
        super.OnUpdate();

        
        if(this.body.position.y < -3)
        { 
            this.body.position = new CANNON.Vec3(-2,5,-3);
            this.body.velocity.setZero();
        }
    }
}

export class Pipe extends GameObject
{
    constructor()
    {
            
        const mesh = AssetLoader.AssetCache.models['pipe'].clone();

        super(mesh, undefined);
        
    }

    OnUpdate()
    {
        super.OnUpdate();
        
        if(this.body.position.y < -3)
        { 
            this.body.position.y = 5
            this.body.velocity.setZero();
        }
    }
}

export function LoadGame()
{
    new Cube();
    new Car();
    new Hand();
    new Pipe();
    new Plane();
}