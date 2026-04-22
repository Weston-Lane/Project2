
import * as THREE from 'three';
import {engine} from './Core/Engine.js'
import * as Objects from './Objects/Objects.js'
import * as AudioManager from './Core/AudioManager.js';
import { audioManager } from './Core/AudioManager.js';




await engine.Init();
audioManager.Init();
Objects.CreateScene();


const projectile = new Objects.Projectile();
const head = new Objects.PlayerRig();
projectile.MakeTarget(head);

const sound = new THREE.Audio(AudioManager.audioManager.audioListener);
sound.setBuffer(AudioManager.audioManager.soundLibrary['gunFire']);
sound.setLoop(false);
sound.setVolume(0.5);
sound.play();    
