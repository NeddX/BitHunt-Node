const socket = io();

let renderer = new Renderer();
let selectedEvent = 0;
let frameCount = 0;

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

const Event =
{
    Nuke:           0,
    Smite:          1
};

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
    const data = JSON.parse(pako.inflate(packet, { to: "string" }));
    
	// i know but performance is not critical in this case
    const elementsToRemove = document.querySelectorAll(".__stat_text");
    elementsToRemove.forEach((element) => { element.remove(); });
	
    const textContainer = document.getElementById("statTextContainer");
    for (let i = 0; i < data.length; ++i)
    {
        const e = document.createElement("p");
        e.textContent = data[i];
        e.classList.add("__stat_text");
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
    let mouseEventArgs =
	{
		x:		x,
		y:		y
	};
	socket.emit("interactions_onMouseDown", mouseEventArgs);
}

function main()
{	
	socket.on("render_update", renderPacketHandler);
    socket.on("stat_update", statPacketHandler);
    socket.on("init_finished", () =>
    {
        const gameContainer = document.getElementsByClassName("gameContainer")[0];
        gameContainer.appendChild(renderer.canvas);
        renderer.attachEvent("mousedown", onMouseClick);
    });

    socket.emit("init_game");
}

window.onload = main;
