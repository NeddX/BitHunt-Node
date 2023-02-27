const ntr = require("./network_renderer");
const entities = require("./entities");
const zlib = require("zlib");

class Scene
{
    constructor(socket, width, height, colour, pixelSize)
    {
        this.socket = socket;
        this.width = width;
        this.height = height;
        this.colour = colour;
        this.pixelSize = pixelSize;
        this.size = this.width * this.height;
        this.entities = new Array(this.width * this.height).fill(null);
        this.activeEntities = [];
		this.renderer = new ntr.NetworkRenderer(
            this.socket, 
            this.width  * this.pixelSize,
            this.height * this.pixelSize
        );
        this.Tags = 
        {
            nullobj:       -1,
            Floor:          0,
            Grass:          1,
            Predator:       2,
            Insect:         3,
            Tarantula:      4,
            EggNest:        5
        };
		this.TagNames =
		{
		};
        this.frameCount = 0;
        this.entitiyCount = new Map();
    }

    worldGen(
        grassCount = 0, 
        insectCount = 0, 
        predatorCount = 0, 
        tarantulaCount = 0,
        )
    {
        // Spawn Grass
        for (let i = 0; i < grassCount; ++i)
        {
            const vec = 
            { 
                x: Math.round(Math.random() * (this.width - 1)), 
                y: Math.round(Math.random() * (this.height - 1))
            };
            if (this.getEntityAtLocation(vec.x, vec.y) == null)
            {
                this.add(entities.Grass, vec.x, vec.y, this.pixelSize, this.pixelSize);
            }
            else
            {
                i--;
            }
        }
        
        // Spawn Insects
        for (let i = 0; i < insectCount; ++i)
        {
            const vec = 
            { 
                x: Math.round(Math.random() * (this.width - 1)), 
                y: Math.round(Math.random() * (this.height - 1))
            };
            if (this.getEntityAtLocation(vec.x, vec.y) == null)
            {
                this.add(entities.Insect, vec.x, vec.y, this.pixelSize, this.pixelSize);
            }
            else
            {
                i--;
            }
        }

        // Spawn Tarantulas
        for (let i = 0; i < tarantulaCount; ++i)
        {
            const vec = 
            { 
                x: Math.round(Math.random() * (this.width - 1)), 
                y: Math.round(Math.random() * (this.height - 1))
            };
            if (this.getEntityAtLocation(vec.x, vec.y) == null)
            {
                this.add(entities.Tarantula, vec.x, vec.y, this.pixelSize, this.pixelSize);
            }
            else
            {
                i--;
            }
        }
    
        // Spawn predators
        for (let i = 0; i < predatorCount; ++i)
        {
            const vec = 
            { 
                x: Math.round(Math.random() * (this.width - 1)), 
                y: Math.round(Math.random() * (this.height - 1))
            };
            if (this.getEntityAtLocation(vec.x, vec.y) == null)
            {
                this.add(entities.Predator, vec.x, vec.y, this.pixelSize, this.pixelSize);
            }
            else
            {
                i--;
            }
        }
    }

    updateStatistics(deltaTime)
    {
		let arr = [];
		for (const [key, value] of this.entitiyCount)
		{
			switch (key)
			{
				case this.Tags.Grass:
					arr.push(`Grasses: ${value}`);
					break;
				case this.Tags.Insect:
					arr.push(`Insects: ${value}`);
					break;
				case this.Tags.EggNest:
					arr.push(`EggNests: ${value}`);
					break;
				case this.Tags.Predator:
					arr.push(`Predators: ${value}`);
					break;
				case this.Tags.Tarantula:
					arr.push(`Tarantulas: ${value}`);
					break;
				default:
					arr.push(`Unknown: ${value}`);
					break;
			}
		}
		const compressedData = zlib.deflateSync(
			JSON.stringify(arr)
		);
        this.socket.emit("stat_update", compressedData);
	}

    onMouseDown(mouseEventArgs)
    {
        console.log(`clicked at: ${mouseEventArgs.x} ${mouseEventArgs.y}`);
    }

    init()
    {
        this.renderer.init();
        this.renderer.backgroundColour(this.colour);
        this.renderer.clear();

        const grassCount = this.size / 4;
        const insectCount = this.size / 8;
        const tarantulaCount = this.size / 32;
        const predatorCount = this.size / (this.size / 4);
        this.worldGen(
            grassCount, 
            insectCount, 
            predatorCount, 
            tarantulaCount);
        
        for (let i = 0; i < this.entities.length; ++i)
        {
            if (this.entities[i]) 
                this.entities[i].init();
        }

        this.updateStatistics(0);

        this.socket.on("interact_mouseDown", this.onMouseDown);
    }

    update(deltaTime)
    {
		/*
		for (let i = 0; i < this.activeEntities.length; ++i)
		{
			let x = this.activeEntities[i];
			this.entities[x].update(deltaTime);
		}
		*/
		
        for (let i = 0; i < this.entities.length; ++i)
        {
            if (this.entities[i])
                this.entities[i].update(deltaTime);
        }

        if (this.frameCount % 2 == 0)
            this.updateStatistics(deltaTime);
    }

    render(deltaTime)
    {
        this.renderer.renderBegin();
        this.renderer.clear();
        for (let i = 0; i < this.entities.length; ++i)
        {
            if (this.entities[i])
                this.entities[i].render(deltaTime);
        }
        this.renderer.renderEnd();
        this.frameCount++;
    }

    add(T, ...args)
    {
        const obj = new T(...args);
        obj.currentScene = this;
        obj.renderer = this.renderer;
        obj.init();
        this.entities[obj.y * this.width + obj.x] = obj;
        if (this.entitiyCount.has(obj.tag))
        {
            let num = this.entitiyCount.get(obj.tag);
            this.entitiyCount.set(obj.tag, ++num);
        }
        else
            this.entitiyCount.set(obj.tag, 1);
        return obj;
    }

    setEntityLocation(entity, x, y)
    {
        this.entities[entity.y * this.width + entity.x] = null;
        this.entities[y * this.width + x] = entity;
        entity.x = x;
        entity.y = y;
    }

    getEntityAtLocation(x, y)
    {
        return this.entities[y * this.width + x];
    }

    remove(entity)
    {
        this.entities[entity.y * this.width + entity.x] = null;
        let num = this.entitiyCount.get(entity.tag);
        this.entitiyCount.set(entity.tag, --num);
    }

    dispose()
    {
        this.entities = null;
        this.renderer.dispose();
        this.renderer = null;
        delete this;
    }
}

module.exports =
{
    Scene
};
