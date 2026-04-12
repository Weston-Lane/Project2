import * as AssetLoader from './Core/TextureObjectLoader'

/* Any models and textures will be loaded in through here. add them via string paths. 
 kind of a shitty implementation but we're on a time crunch */
export async function LoadAssets()
{
    // 1. Grab the dynamic base path from Vite
    const base = import.meta.env.BASE_URL;

    // 2. Append your model paths directly to the base (Do NOT include 'public/')
    const CAR_MODEL = base + 'models/vehicle.glb';
    AssetLoader.AssetCache.models['vehicle'] = 
        await AssetLoader.LoadTextureObjectGLB(CAR_MODEL);

    const PIPE_MODEL = base + 'models/pipe.glb';
    AssetLoader.AssetCache.models['pipe'] = 
        await AssetLoader.LoadTextureObjectGLB(PIPE_MODEL);

    const TARGET_MODEL = base + 'models/Target.glb';
    AssetLoader.AssetCache.models['target'] = 
        await AssetLoader.LoadTextureObjectGLB(TARGET_MODEL);
}