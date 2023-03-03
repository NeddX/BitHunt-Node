class Entity
{
    constructor(x, y, w, h)
    {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.currentScene = null;
        this.renderer = null;
        this.colour = "#000000";
    }
    
    init()
    {
        this.Tags = this.currentScene.Tags;
        this.range = 
        [
            { x: this.x - 1,    y: this.y - 1 },
            { x: this.x,        y: this.y - 1 },
            { x: this.x + 1,    y: this.y - 1 },
            { x: this.x - 1,    y: this.y     },
            { x: this.x + 1,    y: this.y     },
            { x: this.x - 1,    y: this.y + 1 },
            { x: this.x,        y: this.y + 1 },
            { x: this.x + 1,    y: this.y + 1 },
        ];
        this.tags = this.Tags.nullobj;
        this.Season = this.currentScene.Season;
        this.currentSeason = this.currentScene.currentSeason;
    }

    checkFor(tags = [])
    {
        this.range = 
        [
            { x: this.x - 1,    y: this.y - 1 },
            { x: this.x,        y: this.y - 1 },
            { x: this.x + 1,    y: this.y - 1 },
            { x: this.x - 1,    y: this.y     },
            { x: this.x + 1,    y: this.y     },
            { x: this.x - 1,    y: this.y + 1 },
            { x: this.x,        y: this.y + 1 },
            { x: this.x + 1,    y: this.y + 1 },
        ];

        let found = [];
        for (let i = 0; i < this.range.length; ++i)
        {
            if (this.range[i].x <= this.currentScene.width - 1 
                && this.range[i].y <= this.currentScene.height - 1
                && this.range[i].x >= 0 
                && this.range[i].y >= 0)
            {
                let obj = this.currentScene.getEntityAtLocation(
                    this.range[i].x, 
                    this.range[i].y);
                if (obj)
                {
                    for (let x = 0; x < tags.length; ++x) 
                    {
                        if (obj.tag == tags[x]) 
                        {
                            found.push(this.range[i]);
                        }
                    }
                }
                else if (obj == null 
					&& (tags.includes(this.Tags.Floor)
					|| tags.includes(this.Tags.nullobj))) 
                {  
                    found.push(this.range[i]);
                }
            }
        }
        return found;
    }

    checkForAny(checkForEmpty = false)
    {
        this.range = 
        [
            { x: this.x - 1,    y: this.y - 1 },
            { x: this.x,        y: this.y - 1 },
            { x: this.x + 1,    y: this.y - 1 },
            { x: this.x - 1,    y: this.y     },
            { x: this.x + 1,    y: this.y     },
            { x: this.x - 1,    y: this.y + 1 },
            { x: this.x,        y: this.y + 1 },
            { x: this.x + 1,    y: this.y + 1 },
        ];

        let found = [];
        for (let i = 0; i < this.range.length; ++i)
        {
            if (this.range[i].x <= this.currentScene.width - 1 
                && this.range[i].y <= this.currentScene.height - 1
                && this.range[i].x >= 0 
                && this.range[i].y >= 0)
            {
                let obj = this.currentScene.getEntityAtLocation(
                    this.range[i].x, 
                    this.range[i].y);
                if (obj)
                {
                    found.push(this.range[i]);
                }
                else if (checkForEmpty) 
                {  
                    found.push(this.range[i]);
                }
            }
        }
        return found;
    }

    checkForAnyExcept(tags)
    {
        this.range = 
        [
            { x: this.x - 1,    y: this.y - 1 },
            { x: this.x,        y: this.y - 1 },
            { x: this.x + 1,    y: this.y - 1 },
            { x: this.x - 1,    y: this.y     },
            { x: this.x + 1,    y: this.y     },
            { x: this.x - 1,    y: this.y + 1 },
            { x: this.x,        y: this.y + 1 },
            { x: this.x + 1,    y: this.y + 1 },
        ];

        let found = [];
        for (let i = 0; i < this.range.length; ++i)
        {
            if (this.range[i].x <= this.currentScene.width - 1 
                && this.range[i].y <= this.currentScene.height - 1
                && this.range[i].x >= 0 
                && this.range[i].y >= 0)
            {
                let obj = this.currentScene.getEntityAtLocation(
                    this.range[i].x, 
                    this.range[i].y);
                if (obj)
                {
                    for (let x = 0; x < tags.length; ++x) 
                    {
                        if (obj.tag != tags[x]) 
                        {
                            found.push(this.range[i]);
                        }
                    }
                }
            }
        }
        return found;
    }
    
    setPosition(x, y)
    {
        this.currentScene.setEntityLocation(this, x, y);
    }

    update(deltaTime)
    {
        
    }

    render(deltaTime)
    {
        this.renderer.renderRect(
            this.x * this.w, 
            this.y * this.h, 
            this.w, 
            this.h, 
            this.colour);
    }

    dispose()
    {
        this.renderer = null;
        this.currentScene.remove(this);
        this.currentScene = null;
        delete this;
    }
}

class Grass extends Entity
{
    constructor(x, y, w, h)
    {
        super(x, y, w, h);
    }

    init()
    {
        super.init();
        this.tag = this.Tags.Grass;
        this.requiredTime = 5;
        this.lifeTime = 0;

        switch (this.currentScene.currentSeason)
        {
            case this.Season.Winter:
                this.colour = "#94e8ff";
                break;
            case this.Season.Summer:
                this.colour = "#a18b00"
                break;
            default:
                this.colour = "#32a846";
                break;
        }
    }

    update(deltaTime)
    {
        this.currentSeason = this.currentScene.currentSeason;
        this.lifeTime++;
        switch (this.currentSeason)
        {
            case this.Season.Winter:
                this.colour = "#94e8ff";
                if (this.lifeTime >= this.requiredTime + this.requiredTime / 2)
                {
                    let freeCells = this.checkFor([this.Tags.Floor]);
                    if (freeCells.length > 0 && freeCells)
                    {
                    let cell = freeCells[Math.round(Math.random() * (freeCells.length - 1))];
                        this.currentScene.add(Grass, cell.x, cell.y, this.w, this.h);
                    }
                    this.lifeTime = 0;
                }
                break;
            case this.Season.Spring:
                    this.colour = "#32a846";
                    if (this.lifeTime >= this.requiredTime - this.requiredTime / 2)
                    {
                        let freeCells = this.checkFor([this.Tags.Floor]);
                        if (freeCells.length > 0 && freeCells)
                        {
                            let cell = freeCells[Math.round(Math.random() * (freeCells.length - 1))];
                            this.currentScene.add(Grass, cell.x, cell.y, this.w, this.h);
                        }
                        this.lifeTime = 0;
                    }
                break;
            case this.Season.Summer:
                this.colour = "#a18b00";
                if (this.lifeTime >= this.requiredTime)
                {
                    let freeCells = this.checkFor([this.Tags.Floor]);
                    if (freeCells.length > 0 && freeCells)
                    {
                        let cell = freeCells[Math.round(Math.random() * (freeCells.length - 1))];
                        this.currentScene.add(Grass, cell.x, cell.y, this.w, this.h);
                    }
                    this.lifeTime = 0;
                }
                break;
            default:
                this.colour = "#32a846";
                if (this.lifeTime >= this.requiredTime)
                {
                    let freeCells = this.checkFor([this.Tags.Floor]);
                    if (freeCells.length > 0 && freeCells)
                    {
                        let cell = freeCells[Math.round(Math.random() * (freeCells.length - 1))];
                        this.currentScene.add(Grass, cell.x, cell.y, this.w, this.h);
                    }
                    this.lifeTime = 0;
                }
                break;
        }
    }
}

class Predator extends Entity
{
    constructor(x, y, w, h)
    {
        super(x, y, w, h);
    }

    init()
    {
        super.init();
        this.tag = this.Tags.Predator;
        this.energy = 0;
        this.requiredEnergy = 7;
        this.lifeExpectancy = 80;
        this.lifeTime = this.lifeExpectancy;
        this.food = 
        [
            this.Tags.Grass, 
            this.Tags.Insect, 
            this.Tags.Tarantula, 
            this.Tags.EggNest
        ];
        this.canWalkOn =
        [
            this.Tags.Floor
        ];
        this.colour = "#c40017";
        this.gender = Math.round(Math.random());
    }

    reproduce()
    {
        let cells = this.checkFor(this.canWalkOn);
        let possiblePartners = this.checkFor([this.tag]);
        let foundMalePartner = false;
        for (let i = 0; i < possiblePartners.length; ++i)
        {
            let partner = this.currentScene.getEntityAtLocation(
                possiblePartners[i].x,
                possiblePartners[i].y
            );
            if (partner.gender == 1)
                foundMalePartner = true;
        }
        if (cells && cells.length > 0 && foundMalePartner) 
        {
            this.currentScene.add(this.constructor, cells[0].x, cells[0].y, this.w, this.h);
        }
        this.energy = 0;
    }

    move()
    {
        let freeCells = this.checkFor(this.canWalkOn);
        if (freeCells.length > 0 && freeCells)
        {
            let pos = freeCells[Math.round(Math.random() * (freeCells.length - 1))];
            this.setPosition(pos.x, pos.y);
        }
    }

    hunt()
    {
        let cells = this.checkFor(this.food);
        if (cells && cells.length > 0)
        {
            let cell = cells[Math.round(Math.random() * (cells.length - 1))];
            let obj = this.currentScene.getEntityAtLocation(cell.x, cell.y);
            if (obj)
            {
                this.energy++;
                this.currentScene.remove(obj);

                switch (this.currentSeason)
                {
                    case this.Season.Winter:
                        if (this.energy >= this.requiredEnergy + this.requiredEnergy / 2 && this.gender == 0) 
                        {
                            this.reproduce();
                        }
                        break;
                    case this.Season.Spring:
                        if (this.energy >= this.requiredEnergy - this.requiredEnergy / 2 && this.gender == 0) 
                        {
                            this.reproduce();
                        }
                        break;
                    default:
                        if (this.energy >= this.requiredEnergy && this.gender == 0) 
                        {
                            this.reproduce();
                        }
                        break;
                }
            }
            this.lifeTime = this.lifeExpectancy;
        }
    }

    update(deltaTime)
    {
        this.lifeTime--;
        if (this.lifeTime <= 0)
        {
            this.currentScene.remove(this);
            return;
        }
        this.move();
        this.hunt();
    }
}

class Insect extends Predator
{
    constructor(x, y, w, h)
    {
        super(x, y, w, h);
    }

    init()
    {
        super.init();
        this.tag = this.Tags.Insect;
        this.energy = 0;
        this.requiredEnergy = 3;
        this.lifeExpectancy = 40;
        this.lifeTime = this.lifeExpectancy;
        this.food = [this.Tags.Grass];
        this.colour = "#f2ca35";
    }
}

class EggNest extends Entity
{
    constructor(x, y, w, h, T, eggCount, hatchTime, canHatchOn, colour)
    {
        super(x, y, w, h);
        this.eggCount = eggCount;
        this.entityType = T;
        this.lifeTime = hatchTime;
        this.canHatchOn = canHatchOn;
        this.colour = colour;
    }

    init()
    {
        super.init();
        this.tag = this.Tags.EggNest;
    }

    update()
    {
        this.lifeTime--;
        if (this.lifeTime <= 0)
        {
            let cells = this.checkFor(this.canHatchOn);
            for (let i = 0; i < this.eggCount - (this.eggCount - cells.length); ++i)
            {
                this.currentScene.add(this.entityType, cells[i]);
            }
            this.currentScene.remove(this);
        }
    }
}

class Tarantula extends Predator
{
    constructor(x, y, w, h)
    {
        super(x, y, w, h);
    }

    init()
    {
        super.init();
        this.tag = this.Tags.Tarantula;
        this.requiredEnergy = 5;
        this.breedCount = 8;
        this.lifeExpectancy = 60;
        this.lifeTime = this.lifeExpectancy;
        this.food = [this.Tags.Insect];
        this.canWalkOn = 
        [
            this.Tags.Floor,
            this.Tags.Grass
        ];
        this.eggHatchTime = 12;
        this.eggColour = "#969696";
        this.colour = "#000f4d";
    }

    reproduce()
    {
        let freeCells = this.checkFor(this.canWalkOn);
        let cell = freeCells[Math.round(Math.random() * (freeCells.length - 1))];
        if (cell && this.gender == 0)
        {
            this.currentScene.add(
                EggNest, 
                cell.x,
                cell.y, 
                this.w,
                this.h,
                this.constructor, 
                this.breedCount, 
                this.eggHatchTime, 
                this.canWalkOn, 
                this.eggColour);
        }
    }
}

class Soot extends Entity
{
    constructor(x, y, w, h)
    {
        super(x, y, w, h);
    }

    init()
    {
        super.init();
        this.colour = "#171717";
        this.lifeExpectancy = Math.round(Math.random() * (120 - 60) + 60);
        this.lifeTime = this.lifeExpectancy;
    }

    update(deltaTime)
    {
        if (--this.lifeTime <= 0)
        {
            this.currentScene.remove(this);
        }
    }
}

class Fire extends Predator
{
    constructor(x, y, w, h)
    {
        super(x, y, w, h);
    }

    init()
    {
        super.init();
        this.tag = this.Tags.Fire;
        this.food = [this.Tags.Grass, this.Tags.EggNest];
        this.colours = 
        [
            "#f23535",
            "#f27735",
            "#f2b335"
        ];
        this.currentColourID = 0;
        this.colour = this.colours[this.currentColourID];
        this.currentFrame = 0;
        this.lifeExpectancy = Math.round(Math.random() * (30 - 10) + 10);
        this.lifeTime = this.lifeExpectancy;
        this.leavesBehind = Soot;
    }

    hunt()
    {
        let cells = this.checkFor(this.food);
        if (cells && cells.length > 0)
        {
            let cell = cells[Math.round(Math.random() * (cells.length - 1))];
            let obj = this.currentScene.getEntityAtLocation(cell.x, cell.y);
            if (obj)
            {
                this.currentScene.remove(obj);
                this.currentScene.add(this.constructor, obj.x, obj.y, this.w, this.h);
            }
        }
    }

    update(deltaTime)
    {
        if (this.currentScene.currentSeason == this.Season.Summer
            && this.lifeTime > 0)
        {
            // ghetto fire effect
            this.currentColourID = (this.currentColourID + 1 <= this.colours.length - 1) ? ++this.currentColourID : 0;
            this.colour = this.colours[this.currentColourID];
            
            if (this.currentFrame % 20 == 0) this.hunt();
            this.move();

            this.currentFrame++;
            this.lifeTime--;
            return;
        }
        this.currentScene.remove(this);
        this.currentScene.add(this.leavesBehind, this.x, this.y, this.w, this.h);
    }
}

class Uranium extends Entity
{
    constructor(x, y, w, h)
    {
        super(x, y, w, h);
    }

    init()
    {
        super.init();
        this.tag = this.Tags.Uran;
        this.colours =
        [
            "#411496",
            "#5c24c7",
            "#300582"
        ];
        this.currentColourID = 0;
        this.colour = this.colours[this.currentColourID];
        this.currentFrame = 0;
        this.lifeExpectancy = 10;
        this.lifeTime = this.lifeExpectancy;
    }

    spread()
    {
        let cells = this.checkFor([this.Tags.Grass]);
        if (cells && cells.length > 0)
        {
            let cell = cells[Math.round(Math.random() * (cells.length - 1))];
            let obj = this.currentScene.getEntityAtLocation(cell.x, cell.y);
            if (obj)
            {
                this.currentScene.remove(obj);
                this.currentScene.add(this.constructor, cell.x, cell.y, this.w, this.h);
            }
        }
    }

    update(deltaTime)
    {
        if (this.lifeTime > 0)
        {
            this.currentColourID = Math.round(Math.random() * (this.colours.length - 1));
            this.colour = this.colours[this.currentColourID];

            if (Math.random() < 0.125) this.spread();
            this.lifeTime--;
        }
        else this.currentScene.remove(this);
    }
}

class Explosion extends Fire
{
    constructor(x, y, w, h)
    {
        super(x, y, w, h);
    }

    init()
    {
        super.init();
        this.lifeTime = 10;
        this.currentColourID = 0;
        this.colour = this.colours[this.currentColourID];
        this.currentFrame = 0;
        this.leavesBehind = Uranium;
    }

    populate()
    {
        let cells = this.checkFor([this.Tags.Floor]);
        if (cells && cells.length > 0)
        {
            let cell = cells[Math.round(Math.random() * (cells.length - 1))];
            this.currentScene.add(this.constructor, cell.x, cell.y, this.w, this.h);
        }
    }

    update(deltaTime)
    {
        if (this.lifeTime > 0)
        {
            // ghetto fire effect
            this.currentColourID = (this.currentColourID + 1 <= this.colours.length - 1) ? ++this.currentColourID : 0;
            this.colour = this.colours[this.currentColourID];

            this.populate();
            this.lifeTime--;
        }
        else
        {
            this.currentScene.remove(this);
            this.currentScene.add(this.leavesBehind, this.x, this.y, this.w, this.h);
        }
    }
}

module.exports = 
{
    Grass,
    Predator,
    Insect,
    Tarantula,
    EggNest,
    Fire,
    Uranium,
    Explosion
};
