import * as AssetLoader from './Core/TextureObjectLoader'

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

    const GUN_MODEL = AssetLoader.GetPath('models/Gun.glb');
    AssetLoader.AssetCache.models['gun'] = 
        await AssetLoader.LoadTextureObjectGLB(GUN_MODEL);
}