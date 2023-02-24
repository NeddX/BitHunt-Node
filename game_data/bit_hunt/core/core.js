class Scene
{
    constructor(width, height)
    {
        this.width = width;
        this.height = height;
        this.gameObjects = [];
    }

    update()
    {
        
    }
}

class Entity
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }

    update()
    {
        
    }
}

module.exports =
{
    Scene,
    Entity
};