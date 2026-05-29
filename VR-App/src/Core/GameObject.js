import {engine} from './Engine'
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { audioManager } from './AudioManager';
/**
 * Every GameObject child class will need to pass its mesh and phys body into a super()
 * call in its constructor and OnUpdate
 */
export class GameObject
{
    /**
     * @param {THREE.Mesh} mesh 
     * @param {CANNON.Body} body 
     */
    constructor(mesh, body)
    {
        this.group = new THREE.Group();
        /** @type {THREE.Mesh} */
        this.mesh = mesh;
        /** @type {CANNON.Body} */
        this.body = body;
        /** @type {boolean} */
        this.isActive = true;

        /** @type {THREE.Audio} */
        this.audio = new THREE.Audio(audioManager.audioListener);

        if(mesh)
        {
            this.group.add(this.mesh);
        }
        else
        {
            const geo = new THREE.BoxGeometry(0.5,0.5,0.5,1);
            const mat = new THREE.MeshBasicMaterial({ colorWrite: false });
            this.mesh = new THREE.Mesh(geo,mat);
            this.group.add(this.mesh);
            this.mesh.visible = false;
        }

        if(body)
            { this.body = body; }
        else
        {
            const boundingBox = new THREE.Box3().setFromObject(this.mesh);
            const size = new THREE.Vector3();
            boundingBox.getSize(size);
            const center = new THREE.Vector3();
            boundingBox.getCenter(center);

            this.mesh.position.set(-center.x,-center.y,-center.z);

            const shape = new CANNON.Box(new CANNON.Vec3(size.x/2, size.y/2, size.z/2));
            this.body = new CANNON.Body({
                mass: 1,
                type: CANNON.Body.DYNAMIC,
                position: new CANNON.Vec3(0,0,0),
                shape: shape
            });

        }

        //this is a weird JS injection pattern. Allows for OnCollision(event) calls to access class methods
        //Now the CANNON body has a reference to the GameObject
        /** @type {GameObject} */        
        this.body.gameObject = this;

        this.body.addEventListener('collide', this.OnCollision.bind(this));
        
        engine.AddObj(this);
    }

    OnUpdate()
    {
        this.group.position.copy(this.body.position);
        this.group.quaternion.copy(this.body.quaternion); 
    }

    /**
     * @param {Object} event 
     * @param {CANNON.Body} event.body - The specific Cannon body this object collided with.
     * @param {CANNON.Body} event.target - The Cannon body that owns this listener (this.body).
     * @param {CANNON.ContactEquation} event.contact - Mathematical data regarding the impact.
     */
    OnCollision(event)
    {
        
    }

    /**
     * @param {GameObject} other - The object we collided with
     * @param {Object} event - The raw Cannon.js event data
     */
    OnCollisionEnter(other, event)
    {

    }

    /**
     * @param {boolean} isActive
     * !SETTING AN OBJ ACTIVE AND INACTIVE IN THE SAME FRAME WILL CAUSE COLLIDERS TO DISSAPEAR FOREVER
     * !DO NOT DO THAT
     */
    SetActive(isActive)
    {
        this.isActive = isActive;
        if(!isActive)
        {
            this.mesh.visible = false;
            this.body.sleep();

            this.body.velocity.set(0,0,0);
            this.body.angularVelocity.set(0,0,0);

            this.body.collisionFilterGroup = 0;
            this.body.collisionFilterMask = 0;

            engine.RemoveBody(this.body);

        }
        else
        {
            this.mesh.visible = true;

            this.body.collisionFilterGroup = 1;
            this.body.collisionFilterMask = -1;

            engine.physicsWorld.addBody(this.body);

            this.body.wakeUp();
        }
    }

    SetMaterial(mat)
    {
        this.mesh = new THREE.Mesh(this.mesh.geometry, mat);
    }
}

export class Light{

    constructor({light = new THREE.PointLight(0xffffff, 10, 10, 10)} = {})
    {
        new THREE.SphereGeometry({
            radius: 1,
        });
        const geo = new THREE.SphereGeometry(2);
        const mat = new THREE.MeshStandardMaterial({
                    color: 0x777777,
                    wireframe: true });
        this.debugMesh = new THREE.Mesh(geo, mat);
        this.debugMesh.visible = false;
        this.light = light;

    }

    /** @param {boolean} set*/
    ShowOutline(set)
    {
        this.debugMesh.visible = set;
    }

    /** @param {THREE.Vector3} to */
    Move(to)
    {
        this.debugMesh.position.copy(to);
        this.light.position.copy(to);
    }

    AttachTo(obj)
    {
        obj.add(this.light);
        obj.add(this.debugMesh);
    }
}