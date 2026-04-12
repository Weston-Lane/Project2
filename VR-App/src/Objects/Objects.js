import * as THREE from 'three';
import * as CANNON from 'cannon-es'
import {engine} from '../Core/Engine.js'
import { GameObject } from '../Core/GameObject.js';
import * as AssetLoader from '../Core/TextureObjectLoader.js';


export class Cube extends GameObject{
    
    constructor()
    {
        const dim = [5,1,1,1];
        const geo = new THREE.BoxGeometry(dim[0],dim[1],dim[2],dim[3]);
        const mat = new THREE.MeshLambertMaterial({color: 0x0077ff});
        const mesh = new THREE.Mesh(geo, mat);

        const shape = new CANNON.Box(new CANNON.Vec3(dim[0]/2, dim[1]/2, dim[3]/2));
        const body = new CANNON.Body({
            mass: 10, // > 0 means dynamic (affected by gravity)
            shape: shape,
            position: new CANNON.Vec3(0, 1, -7),
            
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
        const mat = new THREE.MeshLambertMaterial({color: 0x999999});
        const mesh = new THREE.Mesh(geo, mat);

        const shape = new CANNON.Plane();
        const body = new CANNON.Body({
            type: CANNON.BODY_TYPES.STATIC,
            shape: shape,
            position: new CANNON.Vec3(0, 0, 0), 
            
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
        this.body.position.set(0,1,-3);
        this.body.quaternion.setFromEuler(0,-90,0);
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

        this.body.position.set(0,3,-7);
        
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

export class Target extends GameObject
{
    constructor()
    {
        const mesh = AssetLoader.AssetCache.models['target'].clone();
        super(mesh,undefined);

        this.body.type = CANNON.Body.STATIC;
        this.body.mass = 0;
        this.body.position.set(0,3,-6);
        const rads = THREE.MathUtils.degToRad(90);
        this.body.quaternion.setFromEuler(rads,0,0);
        
    }

    OnUpdate()
    {
        super.OnUpdate();
    }
}

export class Projectile extends GameObject
{
    constructor()
    {
        const dim = [0.1,0.1,0.4,1];
        const geo = new THREE.BoxGeometry(dim[0],dim[1],dim[2],dim[3]);
        const mat = new THREE.MeshLambertMaterial({color: 0xff7700});
        const mesh = new THREE.Mesh(geo, mat);

        const shape = new CANNON.Box(new CANNON.Vec3(dim[0]/2, dim[1]/2, dim[3]/2));
        const body = new CANNON.Body({
            mass: 0, // > 0 means dynamic (affected by gravity)
            shape: shape,
            type: CANNON.Body.DYNAMIC,
            position: new CANNON.Vec3(0, 5, -7),
            
        });

        super(mesh, body);

        this.target = null;
        this.speed = 5;
        
    }

    OnUpdate()
    {
        super.OnUpdate();   

        if(this.target)
        {
            const tarDir = this.target.body.position.vsub(this.body.position);
            tarDir.normalize();
            this.body.position.addScaledVector(this.speed * engine.timer.getDelta(), 
                                                tarDir, this.body.position);

            this.body.quaternion.setFromVectors(new CANNON.Vec3(0,0,1),tarDir);
        }
    }

    /**
     * @param {GameObject} obj 
     */
    MakeTarget(obj)
    {
        this.target = obj
    }

    ReturnToPool()
    {
        
    }

    OnCollision(event)
    {
        super.OnCollision(event);
        this.group.visible = false;
        
        setTimeout(() => {
            engine.physicsWorld.removeBody(this.body);
        }, 0);

        console.log('hit target');
    }
}

export function LoadGame()
{
    new Cube();
    //new Car();
    new Hand();
    new Plane();
    new Target();
    
}
