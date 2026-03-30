import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; 

export const AssetCache = {
    models: {}
}

export async function LoadTextureObject(glbPath, texturePaths) {
    const gltfLoader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();

    const loadTexture = (path) => {
        if (!path) return Promise.resolve(null);
        return new Promise((resolve, reject) => {
            textureLoader.load(path, resolve, undefined, reject);
        });
    };

    const [gltfData, diffuseMap, normalMap, roughnessMap] = await Promise.all([
        new Promise((resolve, reject) => gltfLoader.load(glbPath, resolve, undefined, reject)),
        loadTexture(texturePaths.diffuse),
        loadTexture(texturePaths.normal),
        loadTexture(texturePaths.roughness)
    ]);

    const object = gltfData.scene; 

    if (diffuseMap)
    {
        diffuseMap.colorSpace = THREE.SRGBColorSpace;
        diffuseMap.flipY = false;
    }

    const material = new THREE.MeshStandardMaterial({
        map: diffuseMap || null,
        normalMap: normalMap || null,
        roughnessMap: roughnessMap || null,
        roughness: roughnessMap ? 1.0 : 0.7,
        metalness: 0.1 
    });

    object.traverse((child) => {
        if (child.isMesh) {
            child.material = material;
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    
    return object; // Returns the THREE.Group
}

