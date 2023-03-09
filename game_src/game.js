const ntr = require("./network_renderer");
const entities = require("./entities");
const pool = require("./entity_pool");
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
        this.activeEntities = 0;
        this.activeEntities = [];
        this.run = true;
        this.renderer = new ntr.NetworkRenderer(
            this.socket,
            this.width * this.pixelSize,
            this.height * this.pixelSize
        );
        this.pool = new pool.EntityPool();
        this.Tags =
        {
            nullobj: -1,
            Floor: 0,
            Grass: 1,
            Predator: 2,
            Insect: 3,
            Tarantula: 4,
            EggNest: 5,
            Fire: 6,
            Uran: 7,
            Soot: 8
        };
        this.Season =
        {
            Autumn: 0,
            Winter: 1,
            Spring: 2,
            Summer: 3
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
            Radiation: 0,
            Virus: 1,
            Fire: 2,
            Bomb: 3
        };
        this.currentSeason = this.Season.Autumn;
        this.frameCount = 0;
        this.entityCount = new Map();
        this.EventType =
        {
            mouseDown: 0
        };
        this.eventStack = new Map();
        this.possibleCauseOfEnd = "Natural Selection";
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
            else i--;
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
            else i--;
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
            else i--;
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
            else i--;
        }
    }

    updateStatistics(deltaTime)
    {
        const arr = [];
        const jsonMap = new Map();
        for (const [key, value] of this.entityCount)
        {
            switch (key)
            {
                case this.Tags.Grass:
                    arr.push(`Grasses: ${value}`);
                    jsonMap.set("Grasses", value);
                    break;
                case this.Tags.Insect:
                    arr.push(`Insects: ${value}`);
                    jsonMap.set("Insects", value);
                    break;
                case this.Tags.EggNest:
                    arr.push(`EggNests: ${value}`);
                    jsonMap.set("EggNests", value);
                    break;
                case this.Tags.Predator:
                    arr.push(`Predators: ${value}`);
                    jsonMap.set("Predators", value);
                    break;
                case this.Tags.Tarantula:
                    arr.push(`Tarantulas: ${value}`);
                    jsonMap.set("Tarantulas", value);
                    break;
                case this.Tags.Fire:
                    arr.push(`Fire particles: ${value}`);
                    jsonMap.set("Fire particles", value);
                    break;
                case this.Tags.Uran:
                    arr.push(`Radioactive particles: ${value}`);
                    jsonMap.set("Radioactive particles", value);
                    break;
                case this.Tags.Soot:
                    arr.push(`Soot: ${value}`);
                    jsonMap.set("Soot", value);
                    break;
            }
        }
        if (deltaTime > 0) arr.push(`FPS: ${Math.round(1 / deltaTime)}`);
        arr.push(`Season: ${this.SeasonStr[this.currentSeason]}`);
        const jsonData = JSON.stringify(arr);
        this.socket.emit("stat_update", jsonData);

        if (this.frameCount % 60 == 0)
            fs.appendFileSync("./stats.json", JSON.stringify(Object.fromEntries(jsonMap)) + "\n", err => { console.log("failed to write to file."); });
    }

    onMouseDown(eventArgs)
    {
        const mX = Math.round(eventArgs.x / (this.renderer.width / this.width));
        const mY = Math.round(eventArgs.y / (this.renderer.height / this.height));

        switch (eventArgs.element)
        {
            case this.GElement.Bomb:
                {
                    const radius = 20;
                    const borderRadius = 0.25;
                    const minVec =
                    {
                        x: mX - (radius / 2),
                        y: mY - (radius / 2)
                    };
                    const maxVec =
                    {
                        x: mX + (radius / 2),
                        y: mY + (radius / 2)
                    };

                    const max = Math.round(radius * borderRadius);
                    let i = max;
                    for (let y = minVec.y; y < maxVec.y; ++y)
                    {
                        for (let x = minVec.x + i; x < maxVec.x - i; ++x)
                        {
                            const entity = this.getEntityAtLocation(x, y);
                            if (entity) this.remove(entity);
                        }

                        if (maxVec.y - y - 1 <= max) i++;
                        else if (i > 0) i--;
                    }

                    this.add(
                        entities.Explosion,
                        mX,
                        mY,
                        this.pixelSize,
                        this.pixelSize,
                        entities.Soot);
                    this.possibleCauseOfEnd = "You went 1999 NATO on them!";
                    break;
                }
            case this.GElement.Radiation:
                {
                    const radius = 20;
                    const borderRadius = 0.25;
                    const minVec =
                    {
                        x: mX - (radius / 2),
                        y: mY - (radius / 2)
                    };
                    const maxVec =
                    {
                        x: mX + (radius / 2),
                        y: mY + (radius / 2)
                    };

                    const max = Math.round(radius * borderRadius);
                    let i = max;
                    for (let y = minVec.y; y < maxVec.y; ++y)
                    {
                        for (let x = minVec.x + i; x < maxVec.x - i; ++x)
                        {
                            const entity = this.getEntityAtLocation(x, y);
                            if (entity) this.remove(entity);
                        }

                        if (maxVec.y - y - 1 <= max) i++;
                        else if (i > 0) i--;
                    }

                    this.add(
                        entities.Explosion,
                        mX,
                        mY,
                        this.pixelSize,
                        this.pixelSize,
                        entities.Uranium);
                    this.possibleCauseOfEnd = "You nuked them all!";
                    this.socket.emit("nuclear_fallout");
                    break;
                }
        }
    }

    init(jsonData)
    {
        this.renderer.init();
        this.renderer.backgroundColour(this.colour);
        this.renderer.clear();

        this.deserialize(jsonData);

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
        if (this.frameCount % 160 == 0)
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
                        if (entity)
                        {
                            this.remove(entity);
                            this.add(entities.Fire, entity.x, entity.y, this.pixelSize, this.pixelSize);
                        }
                        break;
                }
            }
        }
    }

    update(deltaTime)
    {
        if (this.run)
        {
            this.render(deltaTime);
            
            this.pollEvents();

            for (let i = 0; i < this.entities.length; ++i)
            {
                if (this.entities[i])
                { 
                    this.entities[i].update(deltaTime);
                }
            }

            if (this.activeEntities == 0)
            {
                this.socket.emit("game_over", this.possibleCauseOfEnd);
                this.run = false;
            }

            if (this.frameCount % 2 == 0)
                this.updateStatistics(deltaTime);

            this.seasonHandler();
        }
    }

    render(deltaTime)
    {
        if (this.run)
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
    }

    add(T, ...args)
    {
        if (this.activeEntities < this.size)
        {
            const obj = this.pool.getObject(T, ...args);
            obj.currentScene = this;
            obj.renderer = this.renderer;
            obj.init();
            this.entities[obj.y * this.width + obj.x] = obj;
            this.activeEntities++;

            if (this.entityCount.has(obj.tag))
            {
                const count = this.entityCount.get(obj.tag);
                this.entityCount.set(obj.tag, count + 1);
            }
            else
            {
                this.entityCount.set(obj.tag, 1);
            }

            return obj;
        }
        return null;
    }

    remove(entity)
    {
        this.entities[entity.y * this.width + entity.x] = null;
        this.pool.releaseObject(entity);
        this.activeEntities--;

        const count = this.entityCount.get(entity.tag);
        this.entityCount.set(entity.tag, count - 1);

        const p = Math.round((this.activeEntities / this.pool.size) * 100);
        if (p < 60)
        {
            this.pool.collect(p);
            this.activeEntities = this.getAllEntities().length;
        }
    }

    setEntityLocation(entity, x, y)
    {
        this.entities[entity.y * this.width + entity.x] = null;
        this.entities[y * this.width + x] = entity;
        entity.x = x;
        entity.y = y;
    }

    getAllEntities()
    {
        const ret = [];
        for (let i = 0; i < this.entities.length; ++i)
        {
            if (this.entities[i])
            {
                ret.push(this.entities[i]);
            }
        }
        return ret;
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

    serialize(filePath)
    {
        const stream = [];
        for (let i = 0; i < this.entities.length; ++i)
        {
            if (this.entities[i])
                this.entities[i].serialize(stream);
        }
        const jsonData = JSON.stringify(stream);
        fs.writeFileSync(filePath, jsonData);
    }

    deserialize(jsonData)
    {
        const stream = JSON.parse(jsonData);
        for (let i = 0; i < stream.length; ++i)
        {
            const ent = stream[i];
            switch (ent.tag)
            {
                case this.Tags.Grass:
                    this.add(entities.Grass, ent.x, ent.y, ent.w, ent.h);
                    break;
                case this.Tags.Insect:
                    this.add(entities.Insect, ent.x, ent.y, ent.w, ent.h);
                    break;
                case this.Tags.Tarantula:
                    this.add(entities.Tarantula, ent.x, ent.y, ent.w, ent.h);
                    break;
                case this.Tags.Predator:
                    this.add(entities.Predator, ent.x, ent.y, ent.w, ent.h);
                    break;
            }
        }
    }

    dispose()
    {
        this.entities = null;
        this.renderer.dispose();
        this.renderer = null;
        this.pool.dispose();
        this.pool = null;
        delete this;
    }
}

module.exports =
{
    Scene
};
