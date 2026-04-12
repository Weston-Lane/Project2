import * as THREE from 'three';

export class Input
{
    /**
     * @param {THREE.WebGLRenderer} renderer 
     */
    constructor(renderer)
    {
        this.controllers = [
            renderer.xr.getController(0),
            renderer.xr.getController(1)
        ];
    }
    /**
     * @param {number} index 
     * @returns 
     */
    GetController(index)
    {
        return this.controllers[index];
    }
    
}