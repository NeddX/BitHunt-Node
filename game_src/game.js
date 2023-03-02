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
        this.GElement =
        {
            Water:              0,
            Radiation:          1,
            Virus:              2,
            Fire:               3
        };
		this.currentSeason = this.Season.Autumn;
        this.frameCount = 0;
        this.entityCount = new Map();
		this.EventType =
		{
			mouseDown:	0
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

    onMouseDown(eventArgs)
    {
        const mX = Math.round(eventArgs.x / (this.renderer.width		/ this.width));
		const mY = Math.round(eventArgs.y / (this.renderer.height	/ this.height));
        
        switch (eventArgs.element)
        {
            case this.GElement.Water:
                const radius = 10;
                const minVec =
                {
                    x:	mX - radius,
                    y:	mY - radius
                };
                const maxVec =
                {
                    x:	mX + radius,
                    y:	mY + radius
                };
                for (let y = minVec.y; y < maxVec.y; ++y)
		        {
		        	for (let x = minVec.x; x < maxVec.x; ++x)
		        	{
		        		const entity = this.getEntityAtLocation(x, y);
		        		if (entity && entity.tag == this.Tags.Fire)
                        {
		        			this.remove(entity);
                            this.add(entities.Water, x, y, this.pixelSize, this.pixelSize);
                        }
		        	}
		        }
                /*const entity = this.getEntityAtLocation(mX, mY);
                if (entity && entity.tag == this.Tags.Fire)
                {
                    this.remove(entity);
                    this.add(entities.Water, mX, mY, this.pixelSize, this.pixelSize);
                }*/
                break;
        }
        /*
		const mX = Math.round(mouseEventArgs.x / (this.renderer.width		/ this.width));
		const mY = Math.round(mouseEventArgs.y / (this.renderer.height	/ this.height));
		const radius = 10;
		const minVec =
		{
			x:	mX - radius,
			y:	mY - radius
		};
		const maxVec =
		{
			x:	mX + radius,
			y:	mY + radius
		};
		for (let y = minVec.y; y < maxVec.y; ++y)
		{
			for (let x = minVec.x; x < maxVec.x; ++x)
			{
				const entity = this.getEntityAtLocation(x, y);
				if (entity)
					this.remove(entity);
			}
		}
        */
	}

    init(grassCount, insectCount, predatorCount, tarantulaCount)
    {
        this.renderer.init();
        this.renderer.backgroundColour(this.colour);
        this.renderer.clear();

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
        this.socket.emit("season_change", this.currentSeason);

		this.socket.on("interactions_mouseDown", (args) => 
		{
			this.eventStack.set(this.EventType.mouseDown, args); 
		});
	}

	pollEvents()
	{
		for (const [key, value] of this.eventStack)
		{
			switch (key)
			{
				case this.EventType.mouseDown:
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
            
            this.socket.emit("season_change", this.currentSeason);
            
            if (Math.random() <= 0.5)
            {
                switch (this.currentSeason)
                {
                    case this.Season.Summer:
                        const foundEntities = this.getEntitiesByTag(this.Tags.Grass);
                        const entity = foundEntities[Math.round(Math.random() * foundEntities.length - 1)];
                        this.remove(entity);
                        this.add(entities.Fire, entity.x, entity.y, this.pixelSize, this.pixelSize);
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

    getEntitiesByTag(tag)
    {
        const entities = [];
        for (let i = 0; i < this.entities.length; ++i)
        {
            if (this.entities[i])
            {
                if (this.entities[i].tag == tag)
                    entities.push(this.entities[i]);
            }
        }
        return entities;
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
