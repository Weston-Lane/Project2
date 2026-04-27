import ThreeMeshUI from 'three-mesh-ui'
import * as THREE from 'three';
import * as CANNON from 'cannon-es'
import { engine } from './Engine';
import { gameManager } from './GameManager';
import * as AssetLoader from './TextureObjectLoader'
import * as Objects from '../Objects/Objects.js'

const container = new ThreeMeshUI.Block({
 width: 1.2,
 height: 0.7,
 padding: 0.2,
 fontFamily: AssetLoader.GetPath('Fonts/Rye.json'),
 fontTexture: AssetLoader.GetPath('Fonts/Rye.png'),
});


const text = new ThreeMeshUI.Text({
 content: "Some text to be displayed"
});

container.add( text );

container.position.set(0,1,-5);
container.rotation.x = -0.55;
// scene is a THREE.Scene (see three.js)

class WorldUI
{
    constructor(isUpdatable = false)
    {
        /** @type {ThreeMeshUI.Block} */
        this.container = new ThreeMeshUI.Block();

        this.text = new ThreeMeshUI.Text();

        this.container.add(this.text);

        this.isActive = true;

        if(isUpdatable)
        {
            engine.updatableUI.push(this);
        }
    }

    OnUpdate(time)
    {

    }

    Start()
    {

    }

    Stop()
    {

    }
    AddToScene()
    {
        engine.scene.add(this.container);
        this.container.visible = true;
    }

    RemoveFromScene()
    {
        this.container.visible = false;
        
    }

}

class ScoreUI extends WorldUI
{
    constructor()
    {
        
        super();
        this.container.set({
            width: 3,
            height: 1,
            padding: 0.2,
            fontFamily: AssetLoader.GetPath('Fonts/Rye.json'),
            fontTexture: AssetLoader.GetPath('Fonts/Rye.png'),
            fontSize: .5,
        });

        this.text.set({
            content: "Score: 0",
        });

        this.container.position.set(-4,5,-5);
        this.container.rotation.x = 0.55;
        this.container.lookAt(0,0,0);

        gameManager.UI['score'] = this;
    }

    AddToScene()
    {
        super.AddToScene();
    }
}

class TimerUI extends WorldUI
{
    constructor()
    {
        let isUpdatable = true;
        super(isUpdatable);
        
        this.container.set({
            width: 3,
            height: 1,
            padding: 0.2,
            fontFamily: AssetLoader.GetPath('Fonts/Rye.json'),
            fontTexture: AssetLoader.GetPath('Fonts/Rye.png'),
            fontSize: .4,
        });

        this.text.set({
            content: "Time: 0",
        });

        this.container.position.set(4,5,-5);
        this.container.rotation.x = 0.55;
        this.container.lookAt(0,0,0);
        this.startTimer = false;        
        this.startTime = 0;
        gameManager.UI['timer'] = this;

    }

    Start()
    {
        super.Start();
        this.startTime = gameManager.startTime;
    }

    OnUpdate(time)
    {
        
        super.OnUpdate();
        if(gameManager.isPlaying)
        {
            
            const sec = Math.floor(time / 1000);
            const secR = Math.floor(sec - this.startTime) % 60;
            const min = Math.floor(sec / 60);

            const clockMin = min.toString().padStart(2, '0');
            const clockSec = secR.toString().padStart(2, '0');
            this.text.set({
                content: `Time: ${clockMin}:${clockSec}`,
            });
        }
    }

    AddToScene()
    {
        super.AddToScene();
    }
}

class StartButton extends WorldUI
{
    constructor()
    {
        super(false);

        this.container.set({
            width: 2,   
            height: 2,  
            padding: 0.2,
            fontFamily: AssetLoader.GetPath('Fonts/Rye.json'),
            fontTexture: AssetLoader.GetPath('Fonts/Rye.png'),
            fontSize: 0.35,
            
            backgroundColor: new THREE.Color(0xffffff), // White center
            backgroundOpacity: 1.0,
            borderRadius: 1.0, 
            borderWidth: 0.2,
            borderColor: new THREE.Color(0xff0000), 
            fontColor: new THREE.Color(0xff0000), 
            justifyContent: 'center',
            alignItems: 'center'
        });

        this.text.set({
            content: "Shoot To Start",
        });

        this.container.position.set(0,4,-5);
        this.container.rotation.x = 0.55;
        this.container.lookAt(0,0,0);

        gameManager.UI['startButton'] = this;

        this.collider = new Objects.GeneralCollider();
        this.collider.OnCollisionEnterBehavior = (other, event) =>{
            if(other instanceof Objects.UserProjectile)
            {
                this.StartButtonPressed();
            }
        };
        this.collider.body.type = CANNON.Body.STATIC;
        this.collider.UpdateBody(2,2,0.2);
        this.collider.body.position.copy(this.container.position);
        this.collider.body.quaternion.copy(this.container.quaternion);
    }

    StartButtonPressed()
    {
        console.log("start Game");
        gameManager.StartGame();
        this.RemoveFromScene();
        this.collider.body.sleep();
        engine.RemoveBody(this.collider.body);
    }

}

class LoseUI extends WorldUI
{
    constructor()
    {
        
        super();
        this.container.set({
            width: 4,
            height: 3,
            padding: 0.2,
            fontFamily: AssetLoader.GetPath('Fonts/Rye.json'),
            fontTexture: AssetLoader.GetPath('Fonts/Rye.png'),
            fontSize: .5,
        });

        this.text.set({
            content: "GAME OVER! Thanks for Playing CarniVRal",
        });

        this.container.position.set(0,4,-5);
        this.container.rotation.x = 0.55;
        this.container.lookAt(0,0,0);

        gameManager.UI['lose'] = this;
    }

    AddToScene()
    {
        super.AddToScene();
    }
}

class RestartButton extends WorldUI
{
    constructor()
    {
        super(false);

        this.container.set({
            width: 2,   
            height: 2,  
            padding: 0.2,
            fontFamily: AssetLoader.GetPath('Fonts/Rye.json'),
            fontTexture: AssetLoader.GetPath('Fonts/Rye.png'),
            fontSize: 0.35,
            
            backgroundColor: new THREE.Color(0xffffff), // White center
            backgroundOpacity: 1.0,
            borderRadius: 1.0, 
            borderWidth: 0.2,
            borderColor: new THREE.Color(0xff0000), 
            fontColor: new THREE.Color(0xff0000), 
            justifyContent: 'center',
            alignItems: 'center'
        });

        this.text.set({
            content: "Restart",
        });

        this.container.position.set(0,1,-5);
        

        gameManager.UI['restartButton'] = this;

        this.collider = new Objects.GeneralCollider();
        this.collider.OnCollisionEnterBehavior = (other, event) =>{
            if(other instanceof Objects.UserProjectile)
            {
                this.ButtonPressed();
            }
        };
        this.collider.body.type = CANNON.Body.STATIC;
        this.collider.UpdateBody(2,2,0.2);
        this.collider.body.position.copy(this.container.position);
        this.collider.body.quaternion.copy(this.container.quaternion);

        this.RemoveFromScene();
    }

    ButtonPressed()
    {
        this.RemoveFromScene();
        gameManager.RestartGame();
    }

    AddToScene()
    {
        super.AddToScene();
        this.collider.body.wakeUp();
        console.log('body');
        engine.physicsWorld.addBody(this.collider.body);
        
        
    }

    RemoveFromScene()
    {
        super.RemoveFromScene();
        this.collider.body.sleep();
        engine.RemoveBody(this.collider.body);
    }

}

export function LoadUI()
{
    new ScoreUI().AddToScene();
    new TimerUI().AddToScene();
    new StartButton().AddToScene();
    new LoseUI();
    new RestartButton();
}

