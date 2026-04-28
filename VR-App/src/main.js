import * as THREE from 'three';
import {engine} from './Core/Engine.js'
import * as AudioManager from './Core/AudioManager.js';
import { audioManager } from './Core/AudioManager.js';
import { gameManager } from './Core/GameManager.js';

await engine.Init();
audioManager.Init();
gameManager.Init();


const backGroundMusic = new THREE.Audio(AudioManager.audioManager.audioListener);
backGroundMusic.setBuffer(AudioManager.audioManager.soundLibrary['carnivalMusic']);
backGroundMusic.setLoop(true);
backGroundMusic.setVolume(0.3);
backGroundMusic.play();    
