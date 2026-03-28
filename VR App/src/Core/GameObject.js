import {Engine} from './Engine'

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
        /** @type {THREE.Mesh} */
        this.mesh = mesh;
        /** @type {CANNON.Body} */
        this.body = body;
    }

    OnUpdate()
    {
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
    }
}