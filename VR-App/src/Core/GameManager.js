
class GameManager
{
    constructor()
    {
        /** @type {number} */
        this.score = 0;
        /** @type {Record<string, WorldUI} */
        this.UI = { };
    }

    /**
     * 
     * @param {number} addend 
     * @returns {void}
     */
    AddScore(addend)
    {
        this.score += addend;
        this.UI['score']?.text.set({
            content: `Score: ${this.score}`
        });
        
    }
    
}
export const gameManager =  new GameManager();