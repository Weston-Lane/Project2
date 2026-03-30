import * as AssetLoader from './Core/TextureObjectLoader'

/* Any models and textures will be loaded in through here. add them via string paths. 
 kind of a shitty implementation but we're on a time crunch */
export async function LoadAssets()
{
    const CAR_MODEL = '../public/models/vehicle.glb'
    const CAR_DIFFUSE = '../public/models/Textures/colormap.png'
    AssetLoader.AssetCache.models['vehicle'] = await AssetLoader.LoadTextureObject(
        CAR_MODEL, 
        { 
            diffuse: CAR_DIFFUSE,
        }
    );

    const PIPE_MODEL = '../public/models/pipe.glb';
    const PIPE_DIFFUSE = '../public/models/Textures/colormap.png';
    AssetLoader.AssetCache.models['pipe'] = await AssetLoader.LoadTextureObject(
        PIPE_MODEL, 
        { 
            diffuse: PIPE_DIFFUSE,
        }
    );


}