const socket = io();
const urlParams = new URLSearchParams(window.location.search);

const PacketType =
{
    CREATE_CANVAS:              0,
    RENDER_RECT:                1,
    CLEAR_CALL:                 2,
    CLEAR_COLOUR_CALL:          3,
    BATCH_RENDER_BEGIN:         4,
    BATCH_RENDER_END:           5,
    ATTACH_TO_CANVAS:           6,
    DETACH_CANVAS:              7,
    CANVAS_ALIGNMENT:           8,
    RENDER_TEXT:                9
};

const GElement =
{
    Radiation:          0,
    Virus:              1,
    Fire:               2
};

const GElementStr =
[
    "Radiation",
    "Virus",
    "Fire"
];

const Season =
{
    Autumn:			0,
    Winter:			1,
    Spring:			2,
    Summer:			3
};

const SeasonStr =
[
    "Autumn",
    "Winter",
    "Spring",
    "Summer"
];

let renderer = new Renderer();
const backgroundMusic = new Audio("../assets/music/dBSoundworks/cc2g.ogg");
const nukeSfx =
[
    new Audio("../assets/sfx/8bit_nuke_v0.wav"),
    new Audio("../assets/sfx/8bit_nuke_v1.wav"),
    new Audio("../assets/sfx/8bit_nuke_v2.wav"),
    new Audio("../assets/sfx/8bit_nuke_v3.wav")
];
const denySfx = new Audio("../assets/sfx/death.wav");
let activeElement = 0;
let frameCount = 0;
let onWait = false;
let gameCanvasContainer = null;

function renderPacketHandler(packet)
{
    const data = packet.data;
    switch (packet.type)
    {
        case PacketType.CREATE_CANVAS:
            renderer.createCanvas(data.w, data.h);
            break;
        case PacketType.RENDER_RECT:
            renderer.renderRect(
                data.x,
                data.y,
                data.w,
                data.h,
                data.colour
            );
            break;
        case PacketType.RENDER_TEXT:
            renderer.renderText(
                data.text,
                data.x,
                data.y,
                data.colour
            );
            break;
        case PacketType.CLEAR_CALL:
            renderer.clear();
            break;
        case PacketType.CLEAR_COLOUR_CALL:
            renderer.setClearColour(data.colour);
            break;
        case PacketType.BATCH_RENDER_END:
            const renderData = JSON.parse(pako.inflate(data.data, { to: "string" }));
            for (let i = 0; i < renderData.length; ++i)
                renderPacketHandler(renderData[i]);
			//frameCount++;
			//document.getElementById("fr").textContent = `Frame count: ${frameCount}`;
			break;
    }
}

function statPacketHandler(packet)
{	
    const data = JSON.parse(packet);
    
	// i know but performance is not critical in this case
    const elementsToRemove = document.querySelectorAll(".__stat_text");
    elementsToRemove.forEach((element) => { element.remove(); });
	
    const textContainer = document.getElementById("statText");
    for (let i = 0; i < data.length; ++i)
    {
        const e = document.createElement("p");
        e.textContent = data[i];
        e.classList.add("__stat_text");
        e.classList.add("genericText");
        textContainer.appendChild(e);
    }
}

function onMouseClick(eventArgs)
{
    // this can be easily manipulated by virtually anyone but that is besides the point
    // of this project and this is not a shipping product so i dont care
    if (onWait)
    {
        denySfx.play();
        return;
    }

	// move to the server side
	let mulX = renderer.canvas.width  / renderer.canvas.offsetWidth;
	let mulY = renderer.canvas.height / renderer.canvas.offsetHeight;
	let x = Math.round(eventArgs.offsetX  * mulX);
    let y = Math.round(eventArgs.offsetY  * mulY);
    let mEventArgs =
	{
		x:		        x,
		y:		        y,
        element:        activeElement
	};

    switch (activeElement)
    {
        case GElement.Radiation:
            // perform a little nice animation
            const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
            
            const img = document.getElementById("nukeImage");
            
            let mY = eventArgs.clientY - (30 / 2);
            let mX = eventArgs.clientX - (50 / 2);
            let iY = mY - 400;

            img.style.top = mY;
            img.style.left = mX;
            img.style.opacity = 1;

            let rot = 90;
            let speed = 1;
            
            onWait = true;
            function animation()
            {
                if (rot >= -90)
                {
                    rot -= speed;
                    rot = clamp(rot, -90, 90);
                    img.style.transform = `rotate(${rot}deg)`;
                }

                if (iY != mY - 20)
                {
                    iY += speed;
                    iY = clamp(iY, mY - 150, mY - 20);
                    img.style.top = iY;
                }

                speed += 0.8;
                
                if (rot <= -90 && iY == mY - 20)
                {
                    // flash
                    gameCanvasContainer.classList.add("genericShake");
                    renderer.canvas.style.opacity = 0;
                    img.style.opacity = 0;
                    nukeSfx[Math.round(Math.random() * (nukeSfx.length - 1))].play();
                    setTimeout(() => 
                    {
                        socket.emit("interactions_mouseDown", mEventArgs); 
                        renderer.canvas.style.opacity = 1; 
                        setTimeout(() => { onWait = false; }, 5000);
                        gameCanvasContainer.classList.remove("genericShake");
                    }, 300);
                    return;
                }
                window.requestAnimationFrame(animation);
            }
            window.requestAnimationFrame(animation);
            break;
    }
}

function onButtonClick(eventArgs)
{
    if (eventArgs.srcElement.id == "radiationBtn")
        activeElement = GElement.Radiation;
    
    document.getElementById("elementIndicator").textContent = `Active element: ${GElementStr[activeElement]}`;
}

function main()
{	
	socket.on("render_update", renderPacketHandler);
    socket.on("stat_update", statPacketHandler);
    socket.on("init_finished", () =>
    {
        gameCanvasContainer = document.getElementById("gameCanvasContainer");

        gameCanvasContainer.appendChild(renderer.canvas);
        renderer.setID("gameCanvas");
        renderer.attachEvent("mousedown", onMouseClick);

        const buttons = document.getElementsByTagName("button");
        for (let i = 0; i < buttons.length; ++i)
            buttons[i].addEventListener("click", onButtonClick);

        for (let i = 0; i < nukeSfx.length; ++i)
            nukeSfx[i].volume = 0.3;
        
        denySfx.volume = 0.3;
        denySfx.playbackRate = 1.6;

        backgroundMusic.volume = 0.3;
        backgroundMusic.loop = true;
        backgroundMusic.play();
    });
    socket.on("season_change", (seasonID) => 
    {
        const img = document.getElementsByClassName(SeasonStr[seasonID].toLowerCase())[0];
        
        document.querySelector("#background")
            .querySelectorAll("img")
            .forEach(e => { e.style.opacity = 0; });

        img.style.opacity = 1.0;
    });

    socket.emit("init_game", 
    {
        worldWidth:     urlParams.get("worldWidth"),
        worldHeight:    urlParams.get("worldHeight"),
        pixelSize:      8,
        grassCount:     urlParams.get("grassCount"),
        insectCount:    urlParams.get("insectCount"),
        tarantulaCount: urlParams.get("tarantulaCount"),
        preadatorCount: urlParams.get("predatorCount")
    });
}

window.onload = main;
