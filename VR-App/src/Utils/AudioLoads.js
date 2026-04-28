import * as THREE from 'three';
import { audioManager } from "../Core/AudioManager";
import { GetPath } from "../Core/TextureObjectLoader";

export async function LoadSound(audioPath)
{
    return new Promise((resolve,reject) =>{
        const loader = new THREE.AudioLoader();
        loader.load(audioPath, (audioBuffer) => {
            resolve(audioBuffer);
        }, undefined, (error) => {
                console.log(`could not load audio clip ${audioPath}`,error);
                reject(error);
        });
    });
}

/**
 * LOAD ALL AUDIO HERE, SAME AS WITH THE MODELS
 */
export async function LoadAudio()
{
    const GUN_FIRE_PATH = GetPath('Audio/gunFire.ogg');
    audioManager.soundLibrary['gunFire'] = 
        await LoadSound(GUN_FIRE_PATH);
    const BACKGROUND_MUSIC = GetPath('Audio/CarnivalMusic.mp3');
    audioManager.soundLibrary['carnivalMusic'] =
        await LoadSound(BACKGROUND_MUSIC);
    const CANNON_SHOT = GetPath('Audio/cannonShot.mp3');
    audioManager.soundLibrary['cannonShot'] =
        await LoadSound(CANNON_SHOT);

}
