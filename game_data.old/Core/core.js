/* 
                                    core.js
    Այս ֆայլը ամբողջ խաղի հիմքն է և պարունակում է օգտակար ֆունկցիաններ։
    Ֆայլը նաև պատասխանատու է այն ամենի համար, ինչ տեղի է ունենում տեսարանի հետևում, 
    «game engine»-ի նման, բայց իրականում ոչ, քանի որ այն չափազանց պարզ է:
*/

// Դատարկ օբյեկտը այս դեպքում null է
const nullobj = null;

// Հարմարության համար երկչափ վեկտորային կլաս
class Vector2
{
    constructor(x = 0, y = 0)
    {
        this.x = x;
        this.y = y;
    }

    equals(cord)
    {
        return this.x == cord.x && this.y == cord.y;
    }

    newCopy()
    {
        return new Vector2(this.x, this.y);
    }

    static newCopy(vecInst)
    {
        return new Vector2(vecInst.x, vecInst.y);
    }
}

// Օգտակար ֆունկցիաններ
const Util =
{
    randInt: function (lowEnd, highEnd)
    {
        return Math.round(Math.random() * (highEnd - lowEnd) + lowEnd);
    },

    randInt: function (highEnd)
    {
        return Math.round(Math.random() * highEnd);
    },

    randVector: function (lowVec, highVec)
    {
        return new Vector2(Util.randInt(lowVec.x, highVec.x), Util.randInt(lowVec.y, highVec.y));
    },

    randVector: function (highVec)
    {
        return new Vector2(Util.randInt(highVec.x), Util.randInt(highVec.y));
    }
}

/* 
    Խաղի աշխարհի համար պատասխանատու կլասը, որը պահում, հեռացնում, ստեղծում, 
    նկարում և թարմացնում է խաղի օբյեկտները:
*/
class Scene
{
    constructor(width, height, backgroundColour = 0, pixelSize = 8, gameObjects = [])
    {
        this.width = width;
        this.height = height;
        this.pixelSize = pixelSize;
        this.gameObjects = gameObjects;
        this.activeObjects = 0;
        this.backgroundColour = backgroundColour;
        this.objPool = new GameObjectPool();
		
		// function pointers
		this.clear		= null;
		this.background = null;
        this.renderCopy = null;

		// Նախաձեռնենք զանգվածը
        if (gameObjects.length == 0 || !gameObjects)
        {
            this.gameObjects = [];
            for (let i = 0; i < width * height; ++i)
            {
                this.gameObjects.push(nullobj);
            }
        }
        else
        {
            // Թարմացնենք ակտիվ օբյեկտի չափը
            this.activeObjects = 0;
            for (let i = 0; this.gameObjects.length; ++i)
            {
                if (this.gameObjects[i] != nullobj)
                {
                    this.activeObjects++;
                }
            }
        }
    }

    reset(width, height, backgroundColour = 0, pixelSize = 8, gameObjects = [])
    {
        this.width = width;
        this.height = height;
        this.pixelSize = pixelSize;
        this.gameObjects = gameObjects;
        this.backgroundColour = backgroundColour;
        this.objPool = new GameObjectPool();

        // Նախաձեռնենք զանգվածը
        if (gameObjects.length == 0 || !gameObjects)
        {
            this.gameObjects = [];
            for (let i = 0; i < width * height; ++i) 
            {
                this.gameObjects.push(nullobj);
            }
        }
        else
        {
            // Թարմացնենք ակտիվ օբյեկտի չափը
            this.activeObjects = 0;
            for (let i = 0; this.gameObjects.length; ++i)
            {
                if (this.gameObjects[i] != nullobj)
                {
                    this.activeObjects++;
                }
            }
        }
    }

    add(objClass, ...args)
    {
        // Ստուգեք, արդյոք հասել ենք սահմանաչափին
        if (args[0].y * this.width + args[0].x >= this.width * this.height) return;

        let obj = this.objPool.getObject(objClass, ...args);
        obj.currentScene = this;
        obj.pixelSize = this.pixelSize;

        this.gameObjects[args[0].y * this.width + args[0].x] = obj;
        this.activeObjects++;
        return obj;
    }

    remove(obj)
    {
        this.gameObjects[obj.cord.y * this.width + obj.cord.x] = nullobj;
        this.objPool.releaseObject(obj);
        this.activeObjects--;

        // Ստուգեք, թե քանի տոկոս են կազմում ակտիվ օբյեկտները լողավազանում
        // Եթե ​​այն 60%-ից պակաս է, ապա մենք ավելորդ օբյեկտներ ենք պահում լողավազանում, 
        // ուստի պետք է վերացնենք անպետք օբյեկտները «collect()» ֆունկցիան կանչելով
        let p = Math.round((this.activeObjects / this.objPool.size) * 100);
        if (p < 60)
        {
            this.objPool.collect(p);
            this.activeObjects = this.getAllGameObjects().length;
        }
    }

    getAllGameObjects()
    {
        let ret = [];
        for (let i = 0; i < this.gameObjects.length; ++i)
        {
            if (this.gameObjects[i] != nullobj)
            {
                ret.push(this.gameObjects[i]);
            }
        }
        return ret;
    }

    getGameObjectAtLocation(vec)
    {
        return this.gameObjects[vec.y * this.width + vec.x];
    }

    start()
    {
        console.log("Event begin play");
        this.objPool.reserve();

        // Կանչենք «start» ֆունկցիան բոլոր օբյեկտների մոտ
        for (let i = 0; i < this.gameObjects.length; ++i)
        {
            if (this.gameObjects[i] != nullobj)
            {
                this.gameObjects[i].start();
            }
        }
    }

    update()
    {
		// todo: remove p5
        this.clear();
        this.background(this.backgroundColour);
		//console.log(this.activeObjects);	

        // Թարմացնենք խաղի օբյեկտները
        for (let i = 0; i < this.gameObjects.length; ++i)
        {
            if (this.gameObjects[i] != nullobj)
            {
                this.gameObjects[i]._inernalUpdate();
            }
        }
    }
}

/*
    Մայր խաղի օբյեկտների կլասը, որը խաղի յուրաքանչյուր օբյեկտ պետք է ժառանգի և ընդլայնի: 
    Այս կլասը ինտերֆեյս է, ինչը նշանակում է որ այն պարտադիր ընդլայնելու կարիք ունի:
*/
class IGameObject
{
    constructor(vec)
    {
        this.cord = vec;
        this.tag = -1;
        this.colour = "#000000";
        this.frameCount = -1;
    }

    reset(vec)
    {
        this.cord = vec;
        this.currentScene = currentScene;
        this.tag = -1;
        this.colour = "#000000";
        this.frameCount = -1;
    }

    start()
    {

    }

    dispose()
    {
        this.currentScene.remove(this);
    }

    setLocation(newVec)
    {
        this.currentScene.gameObjects[this.cord.y * this.currentScene.width + this.cord.x] = nullobj;
        this.currentScene.gameObjects[newVec.y * this.currentScene.width + newVec.x] = this;
        this.cord = newVec;
    }

    update()
    {
        
    }

    _inernalUpdate()
    {
        // Ստուգեք, արդյոք մենք երկու անգամ չենք թարմացվում նույն շրջանակում
        // Դա տեղի է ունենում, երբ օբյեկտը փոխում է իր կոորդինատներ
        // Սա լավագույն լուծումն է, որը ես կարող եմ գտնել
        //if (this.frameCount == frameCount) return;
        //else this.frameCount = frameCount;

        // Նկարել օբյեկտը
        this.currentScene.renderCopy(
			this.cord.x * this.pixelSize, 
			this.cord.y * this.pixelSize,
			this.colour,
			this.pixelSize);
		//fill(this.colour);
        //rect(this.cord.x * this.pixelSize, this.cord.y * this.pixelSize, this.pixelSize, this.pixelSize);

        // Կանչել օբյեկտի update ֆունկցիան
        this.update();
    }
}

/* 
    Այս կլասը ունիկալ է, քանի որ այն պատասխանատու է խաղի օբյեկտների պահելու և հեռացնելու համար: 
    Խաղային օբյեկտները այս խաղում անմիջապես չեն ոչնչանում եւ չեն ստեղծվում: 
    Դրանք պահվում են «լողավազանում» եւ նորից օգտագործվում են, ուստի կարիք չկա անընդհատ հատկացնել 
    և բաժանել հիշուղություն օբյեկտների համար, որոը կարող է դանդաղեցնել խաղը:
    Բայց երբ խաղի ակտիվ օբյեկտները պակասում են, և օբյեկտների պահանջը նվազում է, 
    ապա լողավազանի օբյեկտները ոչնչացվում են՝ ավելորդ հիշողություն չսպառելու համար:
*/
class GameObjectPool 
{
    constructor() 
    {
        this.pools = {};
        this.size = 0;
    }

    reserve()
    {
        console.log("To be implemented");
    }
  
    getObject(objClass, ...args) 
    {
        // Եթե ​​օբյեկտի կլասի տեսակը գոյություն չունի լողավազանում
        if (!this.pools[objClass]) 
        {
            this.pools[objClass] = [];
        }

        const pool = this.pools[objClass];
        if (pool.length > 0) 
        {
            // Եթե ​​լողավազանում առկա օբյեկտներ կան, վերադարձրեք դրանցից մեկը
            let obj = pool.pop();

            // Վերականգնել այդ օբյեկտը իր սկզբնական վիճակին նախքան վերադառցնելը
            obj.reset(...args);
            
            this.size--;
            return obj;
        } 
        else 
        {
            // Եթե ​​լողավազանը դատարկ է, ստեղծեք նոր օբյեկտը
            return new objClass(...args);
        }
    }
  
    releaseObject(obj) 
    {
        // Ավելացրեք օբյեկտը լողավազանում իր կլասի տեսակին (obj.constructor) համապատասխան
        // Մենք օգտագործում ենք դասի կոնստրուկտորը նույն տիպի դասերը նույնականացնելու համար:
        this.pools[obj.constructor].push(obj);
        this.size++;
    }

    collect(amount)
    {
        // Հաշվել, թե օբյեկտների քանի տոկոսնն է պետք հավաքել և հեռացնել
        let p = Math.round(amount / Object.keys(this.pools).length);

        // Կատարել իտերացիա ավազանի մեջ
        for (const [key, value] of Object.entries(this.pools)) 
        {
            // Հաշվեք, թե քանի օբյեկտ պետք է հեռացվի լողավազանում յուրաքանչյուր կլասի տեսակի համար
            // և կատարենք իտերացիա` եւ հեռացնենք այդ օբյեկտները
            let count = Math.round(this.pools[key].length * p / 100);
            for (let i = 0; i < count; ++i) 
            {
                this.pools[key].pop();
                this.size--;
            }
        }
    }
}

module.exports = 
{
	Scene,
	IGameObject,
	Util,
	Vector2,
	nullobj
};
