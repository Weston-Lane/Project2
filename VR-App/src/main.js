import * as THREE from 'three';
import {engine} from './Core/Engine.js'
import * as AudioManager from './Core/AudioManager.js';
import { audioManager } from './Core/AudioManager.js';
import { gameManager } from './Core/GameManager.js';

await engine.Init();
audioManager.Init();
gameManager.Init();


const sound = new THREE.Audio(AudioManager.audioManager.audioListener);
sound.setBuffer(AudioManager.audioManager.soundLibrary['gunFire']);
sound.setLoop(false);
sound.setVolume(0.5);
sound.play();    
