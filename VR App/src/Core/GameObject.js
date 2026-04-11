import {engine} from './Engine'
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
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
        this.body;

        this.group.add(this.mesh);

        if(body)
            { this.body = body; }
        else
        {
            const boundingBox = new THREE.Box3().setFromObject(mesh);
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
}