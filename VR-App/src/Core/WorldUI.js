import ThreeMeshUI from 'three-mesh-ui'
import { engine } from './Engine';
import * as AssetLoader from './TextureObjectLoader'

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

        this.container.position.set(-4,4,-5);
        this.container.rotation.x = 0.55;
        this.container.lookAt(0,0,0);

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

        this.container.position.set(4,4,-5);
        this.container.rotation.x = 0.55;
        this.container.lookAt(0,0,0);

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
export function LoadUI()
{
    new ScoreUI().AddToScene();
    new TimerUI().AddToScene();
    
}

