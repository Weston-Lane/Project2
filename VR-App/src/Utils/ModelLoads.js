import * as AssetLoader from '../Core/TextureObjectLoader'

/* Any models and textures will be loaded in through here. add them via string paths. 
 kind of a shitty implementation but we're on a time crunch */
export async function LoadAssets()
{

    // 2. Append your model paths directly to the base (Do NOT include 'public/')
    const CAR_MODEL = AssetLoader.GetPath('models/vehicle.glb');
    AssetLoader.AssetCache.models['vehicle'] = 
        await AssetLoader.LoadTextureObjectGLB(CAR_MODEL);
    const PIPE_MODEL = AssetLoader.GetPath('models/pipe.glb');
    AssetLoader.AssetCache.models['pipe'] = 
        await AssetLoader.LoadTextureObjectGLB(PIPE_MODEL);
    const TARGET_MODEL = AssetLoader.GetPath('models/Target.glb');
    AssetLoader.AssetCache.models['target'] = 
        await AssetLoader.LoadTextureObjectGLB(TARGET_MODEL);
    const GUN_MODEL = AssetLoader.GetPath('models/gunjacob.glb');
    AssetLoader.AssetCache.models['gun'] = 
        await AssetLoader.LoadTextureObjectGLB(GUN_MODEL);
    const BULLET_MODEL = AssetLoader.GetPath('models/bullet.glb');
    AssetLoader.AssetCache.models['bullet'] =
        await AssetLoader.LoadTextureObjectGLB(BULLET_MODEL);
    const BOOTH_MODEL = AssetLoader.GetPath('models/BoothRevamp.glb');
    AssetLoader.AssetCache.models['booth'] =
        await AssetLoader.LoadTextureObjectGLB(BOOTH_MODEL);
    const SPIKE_BALL = AssetLoader.GetPath('models/Spikey.glb');
    AssetLoader.AssetCache.models['spike_ball'] =
        await AssetLoader.LoadTextureObjectGLB(SPIKE_BALL);
    const FLOOR_MODEL = AssetLoader.GetPath('models/woodfloor.obj');
    AssetLoader.AssetCache.models['woodfloor'] =
        await AssetLoader.LoadTextureObjectOBJ(FLOOR_MODEL, {
            diffuse: AssetLoader.GetPath('models/Textures/agedplanks1-bl/agedplanks1-albedo.png'),
            normal: AssetLoader.GetPath('models/Textures/agedplanks1-bl/agedplanks1-normal4-ogl.png'),
            roughness: AssetLoader.GetPath('models/Textures/agedplanks1-bl/agedplanks1-roughness.png')
        });
    const BOARDWALK = AssetLoader.GetPath('models/Boardwalk.glb');
    AssetLoader.AssetCache.models['boardwalk'] =
        await AssetLoader.LoadTextureObjectGLB(BOARDWALK);
}