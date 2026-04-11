import * as THREE from 'three';
import * as CANNON from 'cannon-es'
import {engine} from './Core/Engine.js'
import { GameObject } from './Core/GameObject.js';
import * as AssetLoader from './Core/TextureObjectLoader.js';
import {LoadGame} from './Objects/Objects.js'





await engine.Init();


function StartGame()
{
    
}

LoadGame();

engine.camera.position.z = 5;
engine.camera.position.y = 2;


engine.scene.background = new THREE.Color(0x1a1a2e);
engine.scene.add(new THREE.AmbientLight(0x404040, 2));
const light = new THREE.PointLight(0xffffff, 100);
light.position.set(0, 5, 5);
light.castShadow = true;

light.shadow.camera.left = -20;
light.shadow.camera.right = 20;
light.shadow.camera.top = 20;
light.shadow.camera.bottom = -20;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 50;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;

engine.scene.add(light);