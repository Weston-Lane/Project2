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

    AddToScene()
    {
        engine.scene.add(this.container);
    }

    RemoveFromScene()
    {
        engine.scene.remove(this);
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

        gameManager.UI['timer'] = this;

    }

    OnUpdate(time)
    {
        
        super.OnUpdate();
        const sec = Math.floor(time / 1000);
        const secR = sec % 60;
        const min = Math.floor(sec / 60);

        const clockMin = min.toString().padStart(2, '0');
        const clockSec = secR.toString().padStart(2, '0');
        this.text.set({
            content: `Time: ${clockMin}:${clockSec}`,
        });
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
            alignContent: 'center'
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
                console.log("start Game");
                this.RemoveFromScene();
            }
        };
        this.collider.body.type = CANNON.Body.STATIC;
        this.collider.UpdateBody(2,2,0.2);
        this.collider.body.position.copy(this.container.position);
        this.collider.body.quaternion.copy(this.container.quaternion);
    }


}
export function LoadUI()
{
    new ScoreUI().AddToScene();
    new TimerUI().AddToScene();
    new StartButton().AddToScene();
}

