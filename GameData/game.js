/*
                            Game.js
    Հիմնական իրականացումը և խաղի լոգիկան հիմնված են այստեղ:
*/

/* 
    Ինչպես Unity-ն, ես օգտագործում եմ պիտակներ՝ խաղային օբյեկտները նույնականացնելու համար, 
    բայց string օգտագործելու փոխարեն ես օգտագործում եմ «էնումեռատոռներ»:
*/

const Core = require("./Core/core");
const Util = Core.Util;
const Vector2 = Core.Vector2;
const nullobj = Core.nullobj;

const Tags =
{
    NullOpt:            0,
    GenericObj:         1,
    Floor:              2,
    Wall:               3,
    Grass:              4,
    Insect:             5,
    Centipede:          6,
    Segment:            7,
    Tarantula:          8,
    EggNest:            9,
    Predator:           10,
    Player:             11
}

/* 
    «BitHuntScene» կլասը չի տարբերվում իր մայր կլասից, 
    բացառությամբ այն, որ ավելացնում է «worldGen» ֆունկցիան:
*/
class BitHuntScene extends Core.Scene
{
    constructor(width, height, backgroundColour = 0, pixelSize = 8, gameObjects = [])
    {
        super(width, height, backgroundColour, pixelSize, gameObjects);
		console.log(`Width: ${width} Height: ${height}`);
	}

	wgen()
	{
		let vec = Util.randVector(new Vector2(this.width - 1, this.height - 1));
		this.add(Grass, vec);
		console.log(`Added random at (${vec.x}, ${vec.y})`);
	}

    worldGen(grassCount, insectCount, tarantulaCount, predatorCount)
    {
        // Spawn grass
        for (let i = 0; i < grassCount; ++i) 
        {
            let vec = Util.randVector(new Vector2(this.width - 1, this.height - 1));
            if (this.getGameObjectAtLocation(vec) == nullobj)
            {
                this.add(Grass, vec);
            }
            else
            {
                i--;
            }
        }
    
        // Spawn insects
        for (let i = 0; i < insectCount; ++i) 
        {
            let vec = Util.randVector(new Vector2(this.width - 1, this.height - 1));
            if (this.getGameObjectAtLocation(vec) == nullobj)
            {
                this.add(Insect, vec);
            }
            else
            {
                i--;
            }
        }

        // Spawn tarantulas
        for (let i = 0; i < tarantulaCount; ++i) 
        {    
            let vec = Util.randVector(new Vector2(this.width - 1, this.height - 1));
            if (this.getGameObjectAtLocation(vec) == nullobj)
            {
				this.add(Tarantula, vec);
            }
            else
            {
                i--;
            }
        }
    
        // Spawn predators
        for (let i = 0; i < predatorCount; ++i)
        {
            let vec = Util.randVector(new Vector2(this.width - 1, this.height - 1));
            if (this.getGameObjectAtLocation(vec) == nullobj)
            {
                this.add(Predator, vec);
            }
            else
            {
                i--;
            }
        }
    }
}

/* 
    «BitHuntObject» կլասը չի տարբերվում իր մայր կլասից, 
    բացառությամբ այն, որ ավելացնում է «checkFor» ֆունկցիան:
*/
class BitHuntObject extends Core.IGameObject
{
    constructor(vec)
    {
        super(vec);
        this.range = 
        [
            new Vector2(this.cord.x - 1, this.cord.y - 1),
            new Vector2(this.cord.x, this.cord.y - 1),
            new Vector2(this.cord.x + 1, this.cord.y - 1),
            new Vector2(this.cord.x - 1, this.cord.y),
            new Vector2(this.cord.x + 1, this.cord.y),
            new Vector2(this.cord.x - 1, this.cord.y + 1),
            new Vector2(this.cord.x, this.cord.y + 1),
            new Vector2(this.cord.x + 1, this.cord.y + 1),
        ];
		this.gender = 0;
    }

    checkFor(tags = [])
    {
        this.range = 
        [
            new Vector2(this.cord.x - 1, this.cord.y - 1),
            new Vector2(this.cord.x, this.cord.y - 1),
            new Vector2(this.cord.x + 1, this.cord.y - 1),
            new Vector2(this.cord.x - 1, this.cord.y),
            new Vector2(this.cord.x + 1, this.cord.y),
            new Vector2(this.cord.x - 1, this.cord.y + 1),
            new Vector2(this.cord.x, this.cord.y + 1),
            new Vector2(this.cord.x + 1, this.cord.y + 1),
        ];

        let found = [];
        for (let i = 0; i < this.range.length; ++i)
        {
            if (this.range[i].x <= this.currentScene.width - 1 
                && this.range[i].y <= this.currentScene.height - 1
                && this.range[i].x >= 0 
                && this.range[i].y >= 0)
            {
                let obj = this.currentScene.getGameObjectAtLocation(this.range[i]);
                if (obj && obj != nullobj)
                {
                    for (let x = 0; x < tags.length; ++x) 
                    {
                        if (obj.tag == tags[x]) 
                        {
                            found.push(this.range[i]);
                        }
                    }
                }
                // Քանի որ այս խաղում հատակը nullobj է, մենք ստուգում ենք
                // թե արդյոք օբյեկտը ցանկանում է որ մենք ստում կատարենք հատակի համար:
                // Եթե ​​այո, ապա ավելացնել nullobj-ի (հատակի) կոորդինատները։
                else if (obj == nullobj && tags.includes(Tags.Floor)) 
                {  
                    found.push(this.range[i]);
                }
            }
        }
        return found;
    }
}


/* 
    «Grass» կլասը շատ պարզ է: 
    Բացատրության կարիք չունի։
*/
class Grass extends BitHuntObject
{
    constructor(vec)
    {
        super(vec);
        this.tag = Tags.Grass;
        this.requiredTime = 5;
        this.lifeTime = 0;
        this.colour = "#32a846";
    }

    reset(vec)
    {
        this.cord = vec;
        this.lifeTime = 0;
    }

    update()
    {
        this.lifeTime++;
        if (this.lifeTime >= this.requiredTime)
        {
            let freeCells = this.checkFor([Tags.Floor]);
            if (freeCells.length > 0 && freeCells)
            {
                let cell = freeCells[Util.randInt(freeCells.length - 1)];
				this.currentScene.add(Grass, cell);
            }
            this.lifeTime = 0;
        }
    }
}

/*
    «Insect» կլասը բոլոր այլ էականների մայր կլասն է: 
    Այս կլասի ֆունկցիոնալության մեծ մասը ժառանգված է այլ կերպարների կողմից:    
*/
class Insect extends BitHuntObject
{
    constructor(vec)
    {
        super(vec);
        this.tag = Tags.Insect;
        this.energy = 0;
        this.requiredEnergy = 6;
        this.lifeExpectancy = 16;
        this.lifeTime = this.lifeExpectancy;
        this.food = [Tags.Grass];
        this.colour = "#f2ca35";
		//this.gender = Util.
	}

    reset(vec)
    {
        this.cord = vec;
        this.energy = 0;
        this.lifeTime = this.lifeExpectancy;
    }

    reproduce()
    {
        let cells = this.checkFor([Tags.Floor]);
        if (cells.length > 0 && cells) 
        {
            this.currentScene.add(this.constructor, cells[0]);
        }
    }

    move()
    {
        let freeCells = this.checkFor([Tags.Floor]);
        if (freeCells.length > 0 && freeCells)
        {
            this.setLocation(freeCells[Util.randInt(freeCells.length - 1)]);
        }
    }

    hunt()
    {
        let cells = this.checkFor(this.food);
        if (cells)
        {
            let cell = cells[Util.randInt(cells.length - 1)];
            if (cell)
            {
                let obj = this.currentScene.getGameObjectAtLocation(cell);
                if (obj && obj != nullobj)
                {
                    this.energy++;
                    this.currentScene.remove(obj);
    
                    if (this.energy >= this.requiredEnergy) 
                    {
                        this.reproduce();
                    }
                }
                this.lifeTime = this.lifeExpectancy;
            }
        }
    }

    update()
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

/* 
    «EggNest»-ը եզակի կլաս է, որը ծնում է այլ կերպարներ աշխարհում 
    կախված տրված քանակից եւ էակի տեսակից:
*/
class EggNest extends BitHuntObject
{
    constructor(vec, entityType, eggCount, hatchTime, canHatchOn, colour)
    {
        super(vec);
        this.eggCount = eggCount;
        this.entityType = entityType;
        this.lifeTime = hatchTime;
        this.canHatchOn = canHatchOn;
        this.colour = colour;
    }

    reset(vec, entityType, eggCount, hatchTime, canHatchOn, colour)
    {
        this.cord = vec;
        this.entityType = entityType;
        this.eggCount = eggCount;
        this.canHatchOn = canHatchOn;
        this.lifeTime = hatchTime;
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

/* 
    «Tarantula» կլասը ժառանգում է իր ֆունկցիոնալության մեծ մասը «Insect» կլասից, 
    բացառությամբ, որ ուտելիս անմիջապես բազմանալու փոխարեն, 
    այն առաջացնում է «EggNest» կլասի տիպի օբյեկտ և փոխանցում է պահանջվող պարամետրերը:
*/
class Tarantula extends Insect
{
    constructor(vec)
    {
        super(vec);
        this.tag = Tags.Tarantula;
        this.requiredEnergy = 12;
        this.breedCount = 5;
        this.lifeExpectancy = 16;
        this.lifeTime = this.lifeExpectancy;
        this.food = [Tags.Insect];
        this.eggHatchTime = 12;
        this.eggColour = 150;
        this.colour = "#000f4d";
    }

    reset(vec)
    {
        this.cord = vec;
        this.energy = 0;
        this.lifeTime = this.lifeExpectancy;
    }

    reproduce()
    {
        let freeCells = this.checkFor([Tags.Floor, Tags.Grass]);
        let cell = freeCells[Util.randInt(freeCells.length - 1)];
        if (cell)
        {
            this.currentScene.add(EggNest, cell, 
                this.constructor, this.breedCount, 
                this.eggHatchTime, [Tags.Floor, Tags.Grass], this.eggColour);
        }
    }
}

/* 
    «Predator» կլասը ոչնչով չի տարբերվում իր մայր կլասից, բացի նրանից, որ այն ավելի ուժեղ է:
*/
class Predator extends Insect
{
    constructor(vec)
    {
        super(vec);
        this.tag = Tags.Predator;
        this.energy = 0;
        this.requiredEnergy = 7;
        this.lifeExpectancy = 60;
        this.lifeTime = this.lifeExpectancy;
        this.food = [Tags.Grass, Tags.Insect, Tags.Tarantula, Tags.EggNest];
        this.colour = "#c40017";
    }

    reset(vec)
    {
        this.cord = vec;
        this.energy = 0;
        this.lifeTime = this.lifeExpectancy;
    }
}

module.exports = 
{
	BitHuntScene
};
