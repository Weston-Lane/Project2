import * as AssetLoader from './Core/TextureObjectLoader'

/* Any models and textures will be loaded in through here. add them via string paths. 
 kind of a shitty implementation but we're on a time crunch */
export async function LoadAssets()
{
    const CAR_MODEL = '../public/models/vehicle.glb'
    AssetLoader.AssetCache.models['vehicle'] = 
        await AssetLoader.LoadTextureObjectGLB(CAR_MODEL);

    const PIPE_MODEL = '../public/models/pipe.glb';
    AssetLoader.AssetCache.models['pipe'] = 
        await AssetLoader.LoadTextureObjectGLB(PIPE_MODEL);

    const TARGET_MODEL = '../public/models/Target.glb';
    AssetLoader.AssetCache.models['target'] = 
        await AssetLoader.LoadTextureObjectGLB(TARGET_MODEL);
        
}