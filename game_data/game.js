const Tags =
{
    nullobj:    0,
    Floor:      1,
    Grass:      2
};

class GameRenderer
{
    constructor(clear_Func, clearColour_Func, render_Func)
    {
        this.clear = clear_Func;
        this.clearColour = clearColour_Func;
        this.renderRect = render_Func;
    }
}

class Game
{
    constructor(width, height, pixelSize, renderer)
    {
        this.width = width;
        this.height = height;
        this.pixelSize = pixelSize;
        this.map = [];
        this.gameObjects = [];
        this.renderer = renderer;
    }

    init()
    {
        for (let i = 0; i < this.width * this.height; ++i)
        {
            this.map[i] = Tags.Floor;
        }
    }

    __internalUpdate(deltaTime)
    {
        for (let i = 0; i < this.gameObjects.length; ++i)
            if (this.gameObjects[i])
                this.gameObjects[i].update(deltaTime);
    }

    set(x, y, tag)
    {
        this.gameObjects[y * this.width + x] = tag;
    }

    get(x, y)
    {
        return this.gameObjects[y * this.width + x];
    }

    add(TobjectType, ...args)
    {
        let gameObject = new TobjectType(...args);
        gameObject.renderer = this.renderer;
        //this.set(gameObject.x, gameObject.y, gameObject.tag);
        this.gameObjects.push(gameObject);
    }
}

class GameObject
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
        this.tag = Tags.nullobj;
        this.renderer = null;
        this.colour = "#ffffff";
    }

    update(deltaTime)
    {

    }
}

class Grass extends GameObject
{
    constructor(x, y)
    {
        super(x, y);
        this.tag = Tags.Grass;
        this.colour = "#32a846";
    }

    update(deltaTime)
    {
        this.renderer.clear();
        this.renderer.renderRect(this.x, this.y, this.colour, 8);
        //console.log("rendering myself at: " + this.x + ", " + this.y);
    }
}

module.exports =
{
    Game,
    GameRenderer,
    GameObject,
    Tags,
    Grass
};