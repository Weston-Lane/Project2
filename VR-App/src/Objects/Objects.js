import * as THREE from 'three';
import * as CANNON from 'cannon-es'
import {engine} from '../Core/Engine.js'
import { GameObject } from '../Core/GameObject.js';
import * as AssetLoader from '../Core/TextureObjectLoader.js';



/**
 * @extends {GameObject}
 */
export class Cube extends GameObject {
    
    /**
     * @constructor
     */
    constructor()
    {
        const dim = [5,1,1,1];
        const geo = new THREE.BoxGeometry(dim[0],dim[1],dim[2],dim[3]);
        const mat = new THREE.MeshLambertMaterial({color: 0x114411});
        const mesh = new THREE.Mesh(geo, mat);

        const shape = new CANNON.Box(new CANNON.Vec3(dim[0]/2, dim[1]/2, dim[3]/2));
        const body = new CANNON.Body({
            mass: 10, // > 0 means dynamic (affected by gravity)
            shape: shape,
            position: new CANNON.Vec3(0, 1, -7),
            
        });

        super(mesh, body);
        
        /** @type {GameObject | null} */
        this.targetObj = null;
        
        /** @type {number} */
        this.moveSpeed = 1;
    }

    /**
     * @returns {void}
     */
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
     * @returns {void}
     */
    AddTarget(obj)
    {
        this.targetObj = obj;
    }

    /**
     * @param {Object} event
     * @returns {void}
     */
    OnCollision(event)
    {
        super.OnCollision(event);
 
    } 
}

/**
 * @extends {GameObject}
 */
export class Plane extends GameObject
{
    /**
     * @constructor
     */
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

/**
 * @extends {GameObject}
 */
class UserProjectile extends GameObject
{
    /**
     * @constructor
     */
    constructor()
    {   
        const mesh = AssetLoader.AssetCache.models['bullet'].clone();
        mesh.scale.set(0.5,0.5,0.5);

        const boundingBox = new THREE.Box3().setFromObject(mesh);
        const size = new THREE.Vector3();
        boundingBox.getSize(size);
        const center = new THREE.Vector3();
        boundingBox.getCenter(center);

        mesh.position.set(-center.x,-center.y,-center.z);
        
        const shape = new CANNON.Box(new CANNON.Vec3(size.x/2, size.y/2, size.z/2));

        const body = new CANNON.Body({
            mass: 0, // > 0 means dynamic (affected by gravity)
            shape: shape,
            type: CANNON.Body.DYNAMIC,
            position: new CANNON.Vec3(0, 5, -7),
        });

        super(mesh, body);


        this.body.type = CANNON.Body.DYNAMIC;
        this.body.mass = 0;

        /** @type {CANNON.Vec3 | THREE.Vector3} */
        this.tarDir = new CANNON.Vec3(0,0,0);
        
        /** @type {number} */
        this.speed = 5;
        
        /** @type {number} */
        this.totTime = 0;
        
        /** @type {number} */
        this.decayTime = 3;
    }

    /**
     * @returns {void}
     */
    OnUpdate()
    {
        super.OnUpdate();

        if(this.isActive)
        {
            this.totTime += engine.timer.getDelta();
            if(this.totTime >= this.decayTime)
            {
                this.SetActive(false);
                this.totTime = 0;
            }

            this.Move();
        }

    }
    
    /**
     * @returns {void}
     */
    Move()
    {
        this.body.position.addScaledVector(this.speed * engine.timer.getDelta(), 
                                    this.tarDir, this.body.position);
    }

    /**
     * @param {CANNON.Vec3 | THREE.Vector3} forwardAxis 
     * @param {CANNON.Quaternion | THREE.Quaternion} controllerQuaternion 
     * @returns {void}
     */
    FireProjectile(forwardAxis, controllerQuaternion)
    {
        this.SetActive(true);
        this.tarDir = forwardAxis;
        this.body.quaternion.copy(controllerQuaternion);
    }

}

/**
 * @extends {GameObject}
 */
export class Hand extends GameObject
{
    /**
     * @constructor
     */
    constructor()
    {
        const mesh = AssetLoader.AssetCache.models['gun'].clone();
        
        mesh.scale.set(0.5,0.5,0.5);
        const boundingBox = new THREE.Box3().setFromObject(mesh);
        const size = new THREE.Vector3();
        boundingBox.getSize(size);
        const center = new THREE.Vector3();
        boundingBox.getCenter(center);

        mesh.position.set(-center.x,-center.y,-center.z);
        

        const shape = new CANNON.Box(new CANNON.Vec3(size.x/2, size.y/2, size.z/2));

        const body = new CANNON.Body({
            mass: 0,
            type: CANNON.Body.KINEMATIC,
            position: new CANNON.Vec3(0,0,0),
            shape: shape
        });

        super(mesh,body);

        /** @type {THREE.Group | Object} */
        this.controller = engine.input.GetController(0);

        this.controller.addEventListener('selectstart', (event) => {
            this.OnTriggerPull();
        });
        this.controller.addEventListener('selectend', () =>{
            console.log('trigger released');
        })

        /** @type {UserProjectile[]} */
        this.projectilePool = []
        
        /** @type {number} */
        this.maxProjectiles = 10;
        
        for(let i = 0; i<this.maxProjectiles; i++)
        {
            const projectile = new UserProjectile();
            projectile.SetActive(false);
            this.projectilePool.push(projectile);
        }

        /** @type {number} */
        this.fireRate = 5; // 1s/bullets
        
        /** @type {number} */
        this.fireDeltaTime = 0;
    }

    /**
     * @returns {void}
     */
    OnUpdate()
    {
        this.fireDeltaTime += engine.timer.getDelta();
        super.OnUpdate();

        this.body.position.copy(this.controller.position);
        this.body.quaternion.copy(this.controller.quaternion);
        
    }

    /**
     * @returns {void}
     */
    OnTriggerPull()
    {
        if(this.fireDeltaTime <= 1/this.fireRate)
        {
            console.log('firerate too slow. STOP SPAMMIN CLICKS');
            return;
        }

        this.fireDeltaTime = 0;
        const forwardDir = new THREE.Vector3(0,0,-1);

        forwardDir.applyQuaternion(this.body.quaternion);
        forwardDir.normalize();
        for(const projectile of this.projectilePool)
        {
            if(!projectile.isActive)
            {
                projectile.body.position.copy(this.body.position);
                projectile.FireProjectile(forwardDir, this.controller.quaternion);
                return;
            }
        }
    }
}

/**
 * @extends {GameObject}
 */
export class Car extends GameObject
{
    /**
     * @constructor
     */
    constructor()
    {
            
        const mesh = AssetLoader.AssetCache.models['vehicle'].clone();
        super(mesh, undefined);
        this.body.position.set(0,1,-3);
        this.body.quaternion.setFromEuler(0,-90,0);
    }

    /**
     * @returns {void}
     */
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

/**
 * @extends {GameObject}
 */
export class Pipe extends GameObject
{
    /**
     * @constructor
     */
    constructor()
    {
            
        const mesh = AssetLoader.AssetCache.models['pipe'].clone();
        super(mesh, undefined);

        this.body.position.set(0,3,-7);
        
    }

    /**
     * @returns {void}
     */
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

/**
 * @extends {GameObject}
 */
export class Target extends GameObject
{
    /**
     * @constructor
     */
    constructor()
    {
        const mesh = AssetLoader.AssetCache.models['target'].clone();
        mesh.scale.set(0.5,0.5,0.5);
        super(mesh,undefined);

        this.body.type = CANNON.Body.STATIC;
        this.body.mass = 0;
        this.body.position.set(0,3,-6);
        const rads = THREE.MathUtils.degToRad(90);
        this.body.quaternion.setFromEuler(rads,0,0);
        
    }

    /**
     * @returns {void}
     */
    OnUpdate()
    {
        super.OnUpdate();
    }

    /**
     * @param {Object} event 
     * @returns {void}
     */
    OnCollision(event)
    {
        super.OnCollision(event);

        if(event.body.gameObject instanceof UserProjectile)
        {
            console.log('Tager hit');
            event.body.gameObject.SetActive(false);
        }
        
    }
}

/**
 * @extends {GameObject}
 */
export class Projectile extends GameObject
{
    /**
     * @constructor
     */
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

        /** @type {GameObject | null} */
        this.target = null;
        
        /** @type {number} */
        this.speed = 5;
        
        /** @type {number} */
        this.fireTime = 2;
        
        /** @type {number} */
        this.despawnTime = 4;
        
        /** @type {number} */
        this.totTime = 0;
        
        /** @type {boolean} */
        this.isFired = false;
        
        /** @type {boolean} */
        this.isInAir = false;
        
        /** @type {CANNON.Vec3} */
        this.spawnPos = new CANNON.Vec3(0, 5, -7);
        
        /** @type {CANNON.Vec3 | undefined} */
        this.tarDir = undefined;
    }

    /**
     * @returns {void}
     */
    OnUpdate()
    {
        super.OnUpdate();
        
        if(!this.isFired || this.isInAir)
            { this.totTime += engine.timer.getDelta(); }   
        
        if(this.target && this.isFired && !this.isInAir)
        {
            this.isInAir = true;
            this.tarDir = this.target.body.position.vsub(this.body.position);
            this.tarDir.normalize();
            this.body.quaternion.setFromVectors(new CANNON.Vec3(0,0,1),this.tarDir);
        }
        if(this.isInAir)
        {
            this.body.position.addScaledVector(this.speed * engine.timer.getDelta(), 
                                            this.tarDir, this.body.position);
        }
        if(!this.isFired && this.totTime >= this.fireTime )
        {
            this.isFired = true;
        }
        if(this.isInAir && this.totTime >= this.despawnTime)
        {
            this.body.position.copy(this.spawnPos);
            this.isFired = false;
            this.totTime = 0;
            this.isInAir = false;
        }
    }

    /**
     * @param {GameObject} obj 
     * @returns {void}
     */
    MakeTarget(obj)
    {
        this.target = obj
    }

    /**
     * @param {Object} event
     * @returns {void}
     */
    OnCollision(event)
    {
        super.OnCollision(event);

        if(event.body.gameObject == this.target.body.gameObject)
        {           
            this.body.position.copy(this.spawnPos);
            this.isFired = false;
            this.totTime = 0;
            this.isInAir = false;
        }        

    }
}

/**
 * @class
 */
export class ProjectileSpawner
{
    constructor()
    {
        /** @type {Projectile[]} */
        this.projectilePool = [];
        /** @type {number} */
        this.maxProjectiles = 30;
        //Fill Pool
        for(let i = 0; i<this.maxProjectiles; i++)
        {
            const projectile = new Projectile();
            projectile.SetActive(false);
            this.projectilePool.push(projectile);
        }

        /** @type {CANNON.Vec3} */
        this.spawnPos = new CANNON.Vec3(0, 5, -7)

        /** @type {Array<() => void>} */
        this.attacks = [
            () => this.StraightFire(),
        ];
    
    }

    OnUpdate()
    {
        
    }

    // #region ATTACKS
        /************ATTACKS************ */
        StraightFire()
        {
            console.log('Straight Fire');
        }
        /************************ */
    // #endregion

    DoRandomAttack()
    {
        const ran = Math.floor(Math.random() * this.attacks.length);
        this.attacks[ran]();
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
