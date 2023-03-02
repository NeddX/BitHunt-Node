const ntr = require("./network_renderer");
const entities = require("./entities");
const zlib = require("zlib");
const fs = require("fs");

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
            EggNest:        5,
            Fire:           6
        };
		this.Season =
		{
			Autumn:			0,
			Winter:			1,
			Spring:			2,
			Summer:			3
        };
        this.SeasonStr =
        [
            "Autumn",
            "Winter",
            "Spring",
            "Summer"
        ];
		this.currentSeason = this.Season.Summer;
        this.frameCount = 0;
        this.entityCount = new Map();
		this.EventType =
		{
			OnMouseDown:	0
		};
		this.eventStack = new Map();
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
                x: Math.round(Math.random() * (this.width	- 1)), 
                y: Math.round(Math.random() * (this.height	- 1))
            };
            if (this.getEntityAtLocation(vec.x, vec.y) == null)
            {
                this.add(entities.Grass, vec.x, vec.y, this.pixelSize, this.pixelSize);
            }
            else i--;
        }
        
        // Spawn Insects
        for (let i = 0; i < insectCount; ++i)
        {
            const vec = 
            { 
                x: Math.round(Math.random() * (this.width	- 1)), 
                y: Math.round(Math.random() * (this.height	- 1))
            };
            if (this.getEntityAtLocation(vec.x, vec.y) == null)
            {
                this.add(entities.Insect, vec.x, vec.y, this.pixelSize, this.pixelSize);
            }
            else i--;
        }

        // Spawn Tarantulas
        for (let i = 0; i < tarantulaCount; ++i)
        {
            const vec = 
            { 
                x: Math.round(Math.random() * (this.width	- 1)), 
                y: Math.round(Math.random() * (this.height	- 1))
            };
            if (this.getEntityAtLocation(vec.x, vec.y) == null)
            {
                this.add(entities.Tarantula, vec.x, vec.y, this.pixelSize, this.pixelSize);
            }
            else i--;
        }
    
        // Spawn predators
        for (let i = 0; i < predatorCount; ++i)
        {
            const vec = 
            { 
                x: Math.round(Math.random() * (this.width	- 1)), 
                y: Math.round(Math.random() * (this.height	- 1))
            };
            if (this.getEntityAtLocation(vec.x, vec.y) == null)
            {
                this.add(entities.Predator, vec.x, vec.y, this.pixelSize, this.pixelSize);
            }
			else i--;
        }
    }

    updateStatistics(deltaTime)
    {
        let arr = [];
		for (const [key, value] of this.entityCount)
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
        arr.push(`Season: ${this.SeasonStr[this.currentSeason]}`);
        const jsonData = JSON.stringify(arr);
        this.socket.emit("stat_update", jsonData);
        if (this.frameCount % 60 == 0) 
            fs.appendFileSync("./stats.json", jsonData + "\n", err => { console.log("failed to write to file."); });
	}

    onMouseDown(mouseEventArgs)
    {
		let mX = Math.round(mouseEventArgs.x / (this.renderer.width		/ this.width));
		let mY = Math.round(mouseEventArgs.y / (this.renderer.height	/ this.height));
		let radius = 10;
		let minVec =
		{
			x:	mX - radius,
			y:	mY - radius
		};
		let maxVec =
		{
			x:	mX + radius,
			y:	mY + radius
		};
		for (let y = minVec.y; y < maxVec.y; ++y)
		{
			for (let x = minVec.x; x < maxVec.x; ++x)
			{
				let entity = this.getEntityAtLocation(x, y);
				if (entity)
					this.remove(entity);
			}
		}
	}

    init(grassCount, insectCount, predatorCount, tarantulaCount)
    {
        this.renderer.init();
        this.renderer.backgroundColour(this.colour);
        this.renderer.clear();

        //const grassCount = this.size / 4;
        //const insectCount = this.size / 8;
        //const tarantulaCount = this.size / 64;
        //const predatorCount = this.size / (this.size / 4);
        this.worldGen(
            grassCount, 
            insectCount, 
            predatorCount, 
            tarantulaCount
        );

        for (let i = 0; i < this.entities.length; ++i)
        {
            if (this.entities[i]) 
                this.entities[i].init();
        }

        this.updateStatistics(0);

		this.socket.on("interactions_onMouseDown", (args) => 
		{
			this.eventStack.set(this.EventType.OnMouseDown, args); 
		});
	}

	pollEvents()
	{
		for (const [key, value] of this.eventStack)
		{
			switch (key)
			{
				case this.EventType.OnMouseDown:
					this.onMouseDown(value);
					break;
			}
		}
		this.eventStack.clear();
	}

    seasonHandler()
    {
        if (this.frameCount % 90 == 0)
        {
            this.currentSeason = (this.currentSeason + 1 > 3) ? 0 : ++this.currentSeason;
            const rolledNum = Math.random() * 100;
            console.log(`rolled num: ${rolledNum}`);
            if (rolledNum >= 50)
            {
                let randVec = 
                {
                    x:  Math.round(Math.random() * this.width - 1),
                    y:  Math.round(Math.random() * this.height - 1)
                };
                let entity = this.getEntityAtLocation(randVec.x, randVec.y);
                if (entity) this.remove(entity);
                switch (this.currentSeason)
                {
                    case this.Season.Summer:
                        this.add(entities.Fire, randVec.x, randVec.y, this.pixelSize, this.pixelSize);
                        break;
                }
            }
            
        }

    }

    update(deltaTime)
    {
		this.pollEvents();

        for (let i = 0; i < this.entities.length; ++i)
        {
            if (this.entities[i])
                this.entities[i].update(deltaTime);
        }

        if (this.frameCount % 2 == 0)
            this.updateStatistics(deltaTime);
        
        this.seasonHandler();
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
		//process.stdout.write(`\rFrame count: ${this.frameCount}`);
	}

    add(T, ...args)
    {
        const obj = new T(...args);
        obj.currentScene = this;
        obj.renderer = this.renderer;
        obj.init();
        this.entities[obj.y * this.width + obj.x] = obj;
        if (this.entityCount.has(obj.tag))
		{
			let count = this.entityCount.get(obj.tag);
			this.entityCount.set(obj.tag, ++count);
		}
		else this.entityCount.set(obj.tag, 1);
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
		let count = this.entityCount.get(entity.tag);
		this.entityCount.set(entity.tag, --count);
		this.entities[entity.y * this.width + entity.x] = null;
        //entity.dispose();
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
