import * as THREE from 'three';
import * as CANNON from 'cannon-es'
import {engine} from '../Core/Engine.js'
import { gameManager } from '../Core/GameManager.js';
import { GameObject } from '../Core/GameObject.js';
import { Light } from '../Core/GameObject.js';
import * as AssetLoader from '../Core/TextureObjectLoader.js';
import { DEG2RAD, RAD2DEG } from 'three/src/math/MathUtils.js';
import { OculusHandPointerModel } from 'three/examples/jsm/Addons.js';
import { audioManager } from '../Core/AudioManager.js';



/**
 * @extends {GameObject}
 */
export class Booth extends GameObject {
    
    /**
     * @constructor
     */
    constructor()
    {
        const mesh = AssetLoader.AssetCache.models['booth'].clone();
        mesh.scale.set(1.2,1,1);

        super(mesh, undefined);
        this.body.type = CANNON.Body.STATIC;
        this.body.position.set(0,2.5, -8);
        this.body.quaternion.setFromEuler(0,DEG2RAD * 180, 0);

        const lightColors = [
            0x228899,
            0x889922,
            0x882299,
            0x222299,
            0x229922,
            0x882222,
        ];
        let colInd = 0;
        let lightColor = new THREE.Color(0x228899);
        const lightsRoot = this.mesh.getObjectByName("LightWire");
        lightsRoot.children.forEach((childLight) => {
            
            const lightObj = new Light({
                light: new THREE.PointLight(lightColors[colInd], 15, 5, 1)
            });
            lightObj.AttachTo(childLight);
            colInd += 1;
        });
        
    }
    
}
export class Boardwalk extends GameObject {
    
    /**
     * @constructor
     */
    constructor()
    {
        const mesh = AssetLoader.AssetCache.models['boardwalk'].clone();
        mesh.scale.set(1,1,1) ;

        super(mesh, undefined);
        this.body.type = CANNON.Body.STATIC;
        this.body.position.set(0,0.5,0);
        this.body.quaternion.setFromEuler(0,DEG2RAD * 180, 0);
        
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
        
        const mesh = AssetLoader.AssetCache.models['woodfloor'].clone();

        const shape = new CANNON.Plane();
        const body = new CANNON.Body({
            type: CANNON.BODY_TYPES.STATIC,
            shape: shape,
            position: new CANNON.Vec3(0, 0, 0), 
            
        });
        mesh.scale.set(0.3,0.3,0.3);
        body.quaternion.setFromEuler(-Math.PI/2,0,0); //rotate to xz plane
        super(mesh,body);

        this.mesh.traverse((child) => {
            if (child.isMesh && child.material && child.material.map) {
                
                const textures = [
                    child.material.map,
                    child.material.normalMap,
                    child.material.roughnessMap,
                ];

                textures.forEach(tex =>{
                    tex.repeat.set(7,7);
                    tex.needsUpdate = true;
                });
            }
        });
    }
}

/**
 * @extends {GameObject}
 */
export class UserProjectile extends GameObject
{
    /**
     * @constructor
     */
    constructor()
    {   
        const mesh = AssetLoader.AssetCache.models['bullet'].clone();
        mesh.scale.set(0.08,0.08,0.2);

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
        this.speed = 10;
        
        /** @type {number} */
        this.totTime = 0;
        
        /** @type {number} */
        this.decayTime = 3;

        this.audio.setBuffer(audioManager.soundLibrary['gunFire']);
        this.audio.setLoop(false);
        this.audio.setVolume(0.3);
    }

    /**
     * @returns {void}
     */
    OnUpdate()
    {
        super.OnUpdate();

        if(this.isActive)
        {
            this.totTime += engine.timer.deltaTime;
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
        this.body.position.addScaledVector(this.speed * engine.timer.deltaTime, 
                                    this.tarDir, this.body.position);
    }

    /**
     * @param {CANNON.Vec3 | THREE.Vector3} forwardAxis 
     * @param {CANNON.Quaternion | THREE.Quaternion} controllerQuaternion 
     * @returns {void}
     */
    FireProjectile(forwardAxis, controllerQuaternion)
    {
        this.audio.play();
        this.SetActive(true);
        this.tarDir = forwardAxis;
        this.body.quaternion.copy(controllerQuaternion);
    }

    OnCollisionEnter(other, event)
    {
        super.OnCollisionEnter(other, event);

        if(other instanceof Target && other.isActive)
        {
            this.SetActive(false);
            this.totTime = 0;
        }
    }
}

/**
 * @extends {GameObject}
 */
export class HandRight extends GameObject
{
    /**
     * @constructor
     */
    constructor()
    {
        const mesh = AssetLoader.AssetCache.models['gun'].clone();
        
        mesh.scale.set(0.1,0.1,0.1);
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
        this.controller = engine.input.GetController(1); // right controller

        this.controller.addEventListener('selectstart', (event) => {
            this.OnTriggerPull();
        });
        this.controller.addEventListener('selectend', () =>{
            
        })

        /** @type {UserProjectile[]} */
        this.projectilePool = []
        
        /** @type {number} */
        this.maxProjectiles = 20;
        
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

        /** @type {CANNON.Vec3()} offset so the bullet spawns at barrel*/
        this.localOffset = new CANNON.Vec3(0, 0.05, -0.2);


    }

    /**
     * @returns {void}
     */
    OnUpdate()
    {
        this.fireDeltaTime += engine.timer.deltaTime;
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
                const rotateOffset = new CANNON.Vec3();
                this.body.quaternion.vmult(this.localOffset,rotateOffset);
                projectile.body.position.copy(this.body.position.vadd(rotateOffset));

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

        
        this.body.type = CANNON.Body.KINEMATIC;
        this.body.mass = 0;
        
        this.body.position.set(0,0,0);
        const rads = THREE.MathUtils.degToRad(90);
        this.body.quaternion.setFromEuler(rads,0,0);
        
        const lightMesh = this.mesh.getObjectByName("LightAnchor");
        this.topLightColor = new THREE.Color().setRGB(0.8,0.1,0.2);
        this.topLightPower = 3;
        this.topLightDist = 0.5;
        this.topLightFalloff = 1;
        this.topLight = new Light({
            light: new THREE.PointLight(this.topLightColor, this.topLightPower, this.topLightDist, this.topLightFalloff)
        });
        this.topLight.AttachTo(lightMesh);

        const targetLightMesh = this.mesh.getObjectByName("TargetLightAnchor");
        this.lightColor = new THREE.Color().setRGB(1,1,1);
        this.lightPower = 1;
        this.lightDist = 7;
        this.lightFalloff = 5;
        this.light = new Light({
            light: new THREE.PointLight(this.lightColor, this.lightPower, this.lightDist, this.lightFalloff)
        });
        this.light.AttachTo(targetLightMesh);
        
    }

    /**
     * @returns {void}
     */
    OnUpdate()
    {
        super.OnUpdate();

    }

    OnCollisionEnter(other, event)
    {
        super.OnCollision(other, event);

        if(other instanceof UserProjectile && other.isActive)
        {
            this.SetActive(false);
            gameManager.AddScore(1);
        }
        
    }
}

export class TargetCollection extends GameObject
{
    constructor()
    {
        super(undefined,undefined);
        /** @type{Target[]} */
        this.targets = []

        this.targetNum = 12;

        this.startingPos = new CANNON.Vec3(-5, 3, -10);

        this.offsetXScale = 2;
        this.offsetYScale = -1.5;
        for(let i = 0; i<this.targetNum; i++)
        {
            const target = new Target();
            target.SetActive(false);
            this.targets.push(target);         
        }
        this.SetAllTargetsPos();

        /** @type {number} */
        this.currTargets = 1;

        /** @type {number} */
        this.maxTargetCombo = 5;
    }

    OnUpdate()
    {
        super.OnUpdate();
        if(this.currTargets <= 0 && gameManager.isPlaying)
        {
            this.NextTargets();
        }

    }

    SetAllTargetsPos()
    {
        for(let i = 0; i < this.targetNum; i++)
        {
            
            let offset = undefined;
            if(i < this.targetNum/2)
            {
                offset = new CANNON.Vec3(
                                this.startingPos.x + (i * this.offsetXScale),
                                this.startingPos.y, 
                                this.startingPos.z);
            }
            else
            {
                offset = new CANNON.Vec3(
                                this.startingPos.x + (((this.targetNum - 1) - i) * this.offsetXScale),
                                this.startingPos.y + this.offsetYScale, 
                                this.startingPos.z);
            }

            this.targets[i].body.position.set(offset.x,offset.y,offset.z);
        }
    }

    NextTargets()
    {
        const ranMax = Math.floor(Math.random() * this.maxTargetCombo) + 1;
        this.currTargets = ranMax;
        for(let i = 0; i < ranMax; i++)
        {
            let ran = Math.floor(Math.random() * this.targetNum);
            if(this.targets[ran].isActive)
                //if the random tar exists, remove from curr tar
            {
                this.currTargets -= 1;
            }
            this.targets[ran].SetActive(true);
        }

    }

    RemoveAllTargets()
    {
        this.targets.forEach(target =>{
            target.SetActive(false);
        })
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
        // const geo = new THREE.BoxGeometry(dim[0],dim[1],dim[2],dim[3]);
        // const mat = new THREE.MeshLambertMaterial({color: 0xff7700});
        // const mesh = new THREE.Mesh(geo, mat);

        const shape = new CANNON.Box(new CANNON.Vec3(dim[0]/2, dim[1]/2, dim[3]/2));
        const body = new CANNON.Body({
            mass: 0, // > 0 means dynamic (affected by gravity)
            shape: shape,
            type: CANNON.Body.KINEMATIC,
        });

        const mesh = AssetLoader.AssetCache.models['spike_ball'].clone();
        mesh.scale.multiplyScalar(0.08);
        super(mesh, undefined);
        this.body.mass = 0;
        this.body.type = CANNON.Body.KINEMATIC;
        

        /** @type {number} */
        this.speed = 5;
        
        /** @type {number} */
        this.despawnTime = 4;
        
        /** @type {number} */
        this.totTime = 0;
        
        /** @type {boolean} */
        this.isFired = false;
        
        /** @type {boolean} */
        this.isInAir = false;
        
        /** @type {CANNON.Vec3} */
        //this.spawnPos = spawnPos;
        
        /** @type {CANNON.Vec3 | undefined} */
        this.tarDir = new CANNON.Vec3(0,0,0);

        /** @type {number} */
        this.holdTime = 0;

        this.audio.setBuffer(audioManager.soundLibrary['cannonShot']);
        this.audio.setLoop(false);
        this.audio.setVolume(0.1);

        this.playAudioGate = true;
    }

    /**
     * @returns {void}
     */
    OnUpdate()
    {
        super.OnUpdate();
        
        if(this.isInAir)
            { this.totTime += engine.timer.deltaTime; }   
        
        if(!this.isInAir && this.tarDir)
        {
            this.isInAir = true;
            
        }
        if(this.isInAir && this.totTime >= this.holdTime)
        {
            if(this.playAudioGate)
            {
                this.audio.play();
            }
            this.playAudioGate = false;
            this.body.position.addScaledVector(this.speed * engine.timer.deltaTime, 
                                            this.tarDir, this.body.position);
        }
        if(this.isInAir && (this.totTime + this.holdTime) >= this.despawnTime)
        {
            this.SetActive(false);
            this.totTime = 0;
            this.isInAir = false;
            this.isFired = false;
            this.holdTime = 0;
            this.playAudioGate = true;
        }

    }

    /**
     * @param {CANNON.Vec3} dir  
     * @returns {void}
     */
    Fire(dir)
    {
        
        this.tarDir.copy(dir);
        this.tarDir.normalize();
        this.isFired = true;
    }

    /**
     * @param {Object} event
     * @returns {void}
     */
    OnCollision(event)
    {
        super.OnCollision(event);

        if(event.body.gameObject == gameManager.player.body.gameObject)
        {           
            this.SetActive(false);
            this.isFired = false;
            this.totTime = 0;
            this.isInAir = false;
            this.holdTime = 0;
        }        

    }
}

/**
 * @class
 */
export class ProjectileSpawner extends GameObject
{
    constructor()
    {
        super(undefined,undefined);
        /** @type {Projectile[]} */
        this.projectilePool = [];
        /** @type {number} */
        this.maxProjectiles = 50;
        //Fill Pool
        for(let i = 0; i<this.maxProjectiles; i++)
        {
            const projectile = new Projectile();
            projectile.SetActive(false);
            this.projectilePool.push(projectile);
        }

        /** @type {CANNON.Vec3} */
        this.spawnPos = new CANNON.Vec3(0, 3.5, -7)

        /** @type {Array<() => void>} */
        this.attacks = [
            () => this.StraightFire(),
            () => this.BurstFire(),
            () => this.RapidFire(),
        ];

        
        /** @type {number} */
        this.attackTime = 0;

        /** @type {number} */
        this.downTime = 2;

        /** @type {number} */
        this.totTime = 0;
        
        this.spawn1 = false;
        this.spawn2 = false;

        this.spawner1Time = 3;
        this.spawner2Time = 6;

        this.cloneOffset = 4;

        this.isOn = false;

        this.spawnTime = 0;
    }   

    OnUpdate()
    {
        super.OnUpdate();
        
        if(gameManager.isPlaying && this.isOn)
        {
            this.totTime += engine.timer.deltaTime;
        
            if(this.totTime >= this.downTime + this.attackTime)
            {
                this.DoRandomAttack();
                this.totTime = 0;
            }
            
        }

        const timeSinceStart = engine.timer.getElapsed() - gameManager.startTime;
        if(timeSinceStart > this.spawnTime)
        {
            this.isOn = true;
        }
        if(!gameManager.isPlaying)
        {
            this.isOn = false;
        }

    }

    // #region ATTACKS
        /************ATTACKS************ */
        StraightFire()
        {
            let attackTime = 1;
            this.attackTime = attackTime;
            const projectile = this.FindFreeProjectile();
            projectile.SetActive(true);

            projectile.body.position.copy(this.spawnPos);
            const tarDir = gameManager.player.body.position.vsub(projectile.body.position);
            projectile.body.quaternion.setFromVectors(new CANNON.Vec3(0,0,1),tarDir);
            
            projectile.Fire(tarDir);
            
        }

        BurstFire()
        {
            let attackTime = 1;
            let numShots = 4;
            this.attackTime = attackTime;
            let holdTime = 0;
            let holdTimeInc = 0.3;
            for(let i = 0; i < numShots; i++)
            {
                const projectile = this.FindFreeProjectile();
                projectile.SetActive(true);

                projectile.body.position.copy(this.spawnPos);
                const tarDir = gameManager.player.body.position.vsub(projectile.body.position);
                projectile.body.quaternion.setFromVectors(new CANNON.Vec3(0,0,1),tarDir);                
                projectile.holdTime = holdTime;
                holdTime += holdTimeInc;
                
                projectile.Fire(tarDir);
                
            }
            
        }

        RapidFire()
        {
            let attackTime = 1;
            let numShots = 20;
            this.attackTime = attackTime;
            let holdTime = 0;
            let holdTimeInc = 0.1;
            let rotate = 0;
            let rotateInc = 5;
            const playerPos = gameManager.player.body.position;
            for(let i=0;i<numShots;i++)
            {
                const projectile = this.FindFreeProjectile();
                projectile.SetActive(true);

                projectile.body.position.copy(this.spawnPos);
                const tarDir = new CANNON.Vec3(-7,playerPos.y-1,playerPos.z).vsub(projectile.body.position);
                const rotateQuat = new CANNON.Quaternion();
                rotateQuat.setFromEuler(0,DEG2RAD * rotate, 0);
                rotateQuat.vmult(tarDir,tarDir);
                projectile.body.quaternion.setFromVectors(new CANNON.Vec3(0,0,1),tarDir);

                rotate += rotateInc;
                projectile.holdTime = holdTime;
                holdTime += holdTimeInc;
                
                projectile.Fire(tarDir);
            }
        }
        /************************ */
    // #endregion

    DoRandomAttack()
    {
        const ran = Math.floor(Math.random() * this.attacks.length);
        this.attacks[ran]();
    }

    FindFreeProjectile()
    {
        for(const projectile of this.projectilePool)
        {
            if(!projectile.isActive)
            {
                return projectile;
            }
        }
        return undefined;
    }
}

export class PlayerRig extends GameObject
{
    constructor()
    {
        const hitRadius = 0.15
        const geo = new THREE.SphereGeometry(hitRadius);
        const mat = new THREE.MeshBasicMaterial({
            color: 0x999999,
            side: THREE.DoubleSide, 
            wireframe: true 
        });
        const mesh = new THREE.Mesh(geo, mat);

        const headShape = new CANNON.Sphere(hitRadius);
        const body = new CANNON.Body(
            {
                mass: 0, 
                type: CANNON.Body.KINEMATIC, 
                shape: headShape,
                position: new CANNON.Vec3(0,0,0)
            });
         
        super(mesh, body);
        
        /** @type {THREE.WebXRArrayCamera} */
        this.cam = engine.renderer.xr.getCamera();
        
        this.controllerLeft = engine.input.GetController(0);
        this.controllerRight = engine.input.GetController(1);

        //this is a parent to the cam and controllers
        this.group.add(this.cam);
        this.group.add(this.controllerLeft);
        this.group.add(this.controllerRight);

        this.mesh.visible = false;
        
        /** @type {THREE.Vector3} */
        this.hold = new THREE.Vector3(0,0,0);

        // 1. Create a variable to hold the hardware data
        /** @type {Gamepad | null} */
        this.gamepad = null;

        this.controllerRight.addEventListener('connected', (event) => {
            if (event.data && event.data.gamepad) {
                this.gamepad = event.data.gamepad;
            }
        });

        // 3. Snap Turn Settings
        /** @type {boolean} */
        this.hasSnapped = false;
        
        /** @type {number} */
        this.snapAngle = THREE.MathUtils.degToRad(45); // 45 degree increments
    }

    OnUpdate()
    {
        //Must not call the super() here to prevent Parenting "Rocket Ship" bug
        this.cam.getWorldPosition(this.hold);

        this.body.position.copy(this.hold);

        this.mesh.position.copy(this.hold);

        //this.HandleTurn();
    }

    OnCollisionEnter(other, event)
    {
        if(other instanceof Projectile)
        {
            gameManager.LoseGame();
        }
        
    }

    HandleTurn()
    {
        //not working
    }
    
}

export class GeneralCollider extends GameObject
{
    constructor()
    {
        super(undefined,undefined);

        /** @type {function} */
        this.OnCollisionEnterBehavior = undefined;
        this.OnCollisionBehavior = undefined;
    }
        /**
     * 
     * @param {number} x size of bounding box x,y,z 
     * @param {number} y 
     * @param {number} z 
     */
    UpdateBody(x,y,z)
    {
        this.body.removeShape(this.body.shapes[0]);
        const newShape = new CANNON.Box(new CANNON.Vec3(x/2,y/2,z/2));
        this.body.addShape(newShape);
    }

    OnCollision(event)
    {
        if(this.OnCollisionBehavior)
        {
            this.OnCollisionBehavior(event);
        }
    }

    OnCollisionEnter(other, event)
    {
        if(this.OnCollisionEnterBehavior)
        { 
            this.OnCollisionEnterBehavior(other, event);
        }
    }
}

