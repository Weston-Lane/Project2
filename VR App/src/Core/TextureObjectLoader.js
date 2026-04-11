import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; 
import { OBJLoader } from 'three/examples/jsm/Addons.js';

export const AssetCache = {
    models: {}
}

//GLBs have textures in the binary
export async function LoadTextureObjectGLB(glbPath) {
    const gltfLoader = new GLTFLoader();
    const gltfData = await gltfLoader.loadAsync(glbPath);
    const object = gltfData.scene;

    object.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    
    return object;
}

export async function LoadTextureObjectOBJ(objPath, texturePaths) {
    const objLoader = new OBJLoader();
    const textureLoader = new THREE.TextureLoader();

    const loadTexture = (path) => {
        if (!path) return Promise.resolve(null);
        return new Promise((resolve, reject) => {
            textureLoader.load(path, resolve, undefined, reject);
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

    objGroup.traverse((child) => {
        if (child.isMesh) {
            child.material = material;
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    return objGroup;
}

