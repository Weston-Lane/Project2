import * as Objects from '../Objects/Objects'
import { engine } from './Engine';

class GameManager
{
    constructor()
    {
        
        /** @type {number} */
        this.score = 0;
        /** @type {Record<string, WorldUI} */
        this.UI = { };

        /** @type {Objects.TargetCollection} */
        this.targetCollection = undefined;

        /** @type {Objects.PlayerRig} */
        this.player = undefined;

        /** @type {Objects.ProjectileSpawner} */
        this.projectileSpawner = undefined;

        /**@type {number} */
        this.startTime = 0;

        /**@type {bool} */
        this.isPlaying = false;
    }

    Init()
    {
        this.CreateScene();
    }

    /**
     * 
     * @param {number} addend 
     * @returns {void}
     */
    AddScore(addend)
    {
        if(this.isPlaying)
        {
            this.score += addend;
            this.UI['score']?.text.set({
                content: `Score: ${this.score}`
            });
            this.targetCollection.currTargets -= 1;
        }
    }

    StartGame()
    {
        this.isPlaying = true;
        this.startTime = engine.timer.getElapsed();
        this.targetCollection.SetAllTargetsPos();
        this.UI['timer'].Start();
        this.targetCollection.NextTargets();        
    }

    LoseGame()
    {
        this.UI['lose'].AddToScene();
        this.UI['restartButton'].AddToScene();
        this.UI['timer'].Stop();
        this.isPlaying = false;
        
    }

    RestartGame()
    {
        console.log('restart game');
        this.UI['lose'].RemoveFromScene();
        this.UI['score']?.text.set({
            content: 'Score: 0'
        });
        this.score = 0;
        this.targetCollection.RemoveAllTargets();

        this.targetCollection.currTargets = 0;
        this.isPlaying = true;
        this.startTime = engine.timer.getElapsed();
        this.targetCollection.SetAllTargetsPos();
        this.UI['timer'].Start();
    }

    CreateScene()
    {
        new Objects.Booth();
        new Objects.Boardwalk();
        this.player = new Objects.PlayerRig();
        new Objects.HandRight();
        //new Objects.Plane();
        
        this.targetCollection = new Objects.TargetCollection();
        this.projectileSpawner = new Objects.ProjectileSpawner();
        const projectileSpawner1 = new Objects.ProjectileSpawner();
        projectileSpawner1.isOn = false;
        projectileSpawner1.spawnTime = 20;
        projectileSpawner1.spawnPos.x -= projectileSpawner1.cloneOffset;
        const projectileSpawner2 = new Objects.ProjectileSpawner();
        projectileSpawner2.isOn = false;
        projectileSpawner2.spawnTime = 60;
        projectileSpawner2.spawnPos.x += projectileSpawner2.cloneOffset;
    }
    
}
export const gameManager =  new GameManager();