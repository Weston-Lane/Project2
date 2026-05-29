import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; 
import { OBJLoader } from 'three/examples/jsm/Addons.js';

/**
 * @type {{ models: Record<string, THREE.Group | THREE.Object3D> }}
 */
export const AssetCache = {
    models: {}
}

//GLBs have textures in the binary
/**
 * @param {string} glbPath 
 * @returns {Promise<THREE.Group>}
 */
export async function LoadTextureObjectGLB(glbPath) {
    const gltfLoader = new GLTFLoader();
    try{
        const gltfData = await gltfLoader.loadAsync(glbPath);
        const object = gltfData.scene;

        object.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        return object;

    }catch (error){
        console.error(`Failed to load glb at ${glbPath}\n`);
        console.error("Direct error message: ", error);
        return null;
    }
    
    
    
}

/**
 * @param {string} objPath 
 * @param {{ diffuse?: string, normal?: string, roughness?: string }} texturePaths 
 * @returns {Promise<THREE.Group>}
 */
export async function LoadTextureObjectOBJ(objPath, texturePaths) {
    const objLoader = new OBJLoader();
    const textureLoader = new THREE.TextureLoader();

    const loadTexture = (path) => {
        if (!path) return Promise.resolve(null);
        return new Promise((resolve, reject) => {
            const failedPath = (error) =>{
                console.error(`Could not load obj file ${path}`);
                console.error("Original error: ", error);
                reject(error);
            }
            textureLoader.load(path, resolve, undefined, failedPath);
        });
    };

    const [objGroup, diffuseMap, normalMap, roughnessMap] = await Promise.all([
        new Promise((resolve, reject) => objLoader.load(objPath, resolve, undefined, reject)),
        loadTexture(texturePaths.diffuse),
        loadTexture(texturePaths.normal),
        loadTexture(texturePaths.roughness)
    ]);

    if (diffuseMap) {
        diffuseMap.colorSpace = THREE.SRGBColorSpace;
    }

    const material = new THREE.MeshStandardMaterial({
        map: diffuseMap || null,
        normalMap: normalMap || null,
        roughnessMap: roughnessMap || null,
        roughness: roughnessMap ? 1.0 : 0.7,
        metalness: 0.1 
    });

    const textures = [
        material.map,
        material.normalMap,
        material.roughnessMap,
    ];

    
    textures.forEach(tex =>{
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
    });

    objGroup.traverse((child) => {
        if (child.isMesh) {
            child.material = material;
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    return objGroup;
}

/**
 * @param {string} assetPath 
 * @returns {string}
 */
export function GetPath(assetPath)
{
    return import.meta.env.BASE_URL + assetPath;
}

