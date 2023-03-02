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
    Water:              0,
    Radiation:          1,
    Virus:              2,
    Fire:               3
};

const GElementStr =
[
    "Water",
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
let backgroundMusic = new Audio("../assets/music/dBSoundworks/cc2g.ogg");
let activeElement = 0;
let frameCount = 0;

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
	socket.emit("interactions_mouseDown", mEventArgs);
}

function onButtonClick(eventArgs)
{
    if (eventArgs.srcElement.id == "waterBtn")
        activeElement = GElement.Water;
    else if (eventArgs.srcElement.id == "radiationBtn")
        activeElement = GElement.Radiation;
    
    document.getElementById("elementIndicator").textContent = `Active element: ${GElementStr[activeElement]}`;
}

function main()
{	
	socket.on("render_update", renderPacketHandler);
    socket.on("stat_update", statPacketHandler);
    socket.on("init_finished", () =>
    {
        const gameContainer = document.getElementById("content");

        gameContainer.appendChild(renderer.canvas);
        renderer.setID("gameCanvas");
        renderer.addClassList("genericContainer");
        renderer.attachEvent("mousedown", onMouseClick);

        const buttons = document.getElementsByTagName("button");
        for (var i = 0; i < buttons.length; i++)
            buttons[i].addEventListener("click", onButtonClick);
        
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
