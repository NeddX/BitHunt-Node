/* 
                                    main.js
    Խաղը բաժանված է 3 ֆայլերից՝ «main.js», «game.js» և «core.js»:
    «main.js»-ը պատասխանատու է աշխարհի ստեղծման, գործարկման և թարմացման համար:
    «game.js»-ը պատասխանատու է խաղի կոդի և տրամաբանության համար:
    «core.js»-ը պատասխանատու է այն ամենի համար, ինչ տեղի է ունենում տեսարանի հետևում: 
    Այն կառավարում է օբյեկտները և նկարում դրանք:
*/

const Game = require("./game");

class BitHunt
{
	constructor(
		width, 
		height, 
		pixelSize, 
		clear_Func, 
		background_Func,
		renderCopy_Func)
	{
		
		this.scWorld = new Game.BitHuntScene(width, height, pixelSize);
		this.scWorld.renderCopy = renderCopy_Func;
		this.scWorld.clear = clear_Func;
		this.scWorld.rendeCopy = renderCopy_Func;
		this.scWorld.background = background_Func;

		this.size = this.scWorld.height * this.scWorld.width;
		this.grassEaterCount = this.size / 4;
		this.insectCount = this.size / 16;
		this.tarantulaCount = this.size / 32;
		this.predatorCount = this.size / (this.size / 4);
		 
		/*
		this.scWorld.worldGen(
			this.grassEaterCount, 
			this.insectCount, 
			this.tarantulaCount, 
			this.predatorCount);
		*/
		this.scWorld.wgen();
		//this.scWorld.worldGen(1, 0, 0, 0);
		this.scWorld.start();
	}

	update(deltaTime)
	{
		this.scWorld.update();
	}
}

//let scWorld = new BitHuntScene(WIDTH, HEIGHT, "#253140", PIXEL_SIZE);
/*
function setup()
{
    //p5.disableFriendlyErrors = true;

    //createCanvas(scWorld.width * scWorld.pixelSize, scWorld.height * scWorld.pixelSize + 35);
    //noStroke();
    //strokeWeight(0.05);
    //frameRate(20);

    let size = scWorld.height * scWorld.width;
    let grassEaterCount = size / 4;
    let insectCount = size / 16;
    let tarantulaCount = size / 32;
    let predatorCount = size / (size / 4);
    
    scWorld.worldGen(grassEaterCount, insectCount, tarantulaCount, predatorCount);
    scWorld.start();
}

function update(deltaTime)
{
	console.log(`delta: ${deltaTime}`);
    //scWorld.update();

    // Draw the fps text
    //textSize(32);
    //fill(255);
    //text(`FPS: ${Math.round(frameRate())}`, 0, HEIGHT * PIXEL_SIZE + 30);
}
*/

module.exports = { BitHunt };
