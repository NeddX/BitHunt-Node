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

const Tags = 
{
    nullobj:       -1,
    Floor:          0,
    Grass:          1,
    Predator:       2,
    Insect:         3,
    Tarantula:      4,
    EggNest:        5
};

const TagsStr =
{
    0:          "Floor",
    1:          "Grasses",
    2:          "Predators",
    3:          "Insects",
    4:          "Tarantulas",
    5:          "EggNests"
};

const Event =
{
    Nuke:           0,
    Smite:          1
};

const socket = io();

let renderer = new Renderer();
let selectedEvent = 0;

function renderPacketHandler(packet)
{
    const data = packet.data;
    switch (packet.type)
    {
        case PacketType.CREATE_CANVAS:
            renderer.createCanvas(data.w, data.h);
            break;
        case PacketType.ATTACH_TO_CANVAS:
            renderer.attachTo(id, data.parentID);
            break;
        case PacketType.DETACH_CANVAS:
            renderer.detach(id);
            break;
        case PacketType.CANVAS_ALIGNMENT:
            renderer.setAlignment(data.alignment);
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
            break;
    }
}

function statPacketHandler(packet)
{
    const dcData = pako.inflate(packet, { to: "string" });
    const map = JSON.parse(dcData);
    
    const elementsToRemove = document.querySelectorAll(".__stat_text");
    elementsToRemove.forEach((element) => { element.remove(); });

    const textContainer = document.getElementById("statTextContainer");
    for (let i = 0; i < map.length; ++i)
    {
        const e = document.createElement("p");
        e.textContent = `${TagsStr[map[i][0]]}: ${map[i][1]}`;
        e.classList.add("__stat_text");
        textContainer.appendChild(e);
    }
}

function onMouseClick(eventArgs)
{
    const diffW = Math.round(renderer.width  / renderer.canvas.clientWidth);
    const diffH = Math.round(renderer.height / renderer.canvas.clientHeight);
    const x = eventArgs.offsetX * diffW;
    const y = eventArgs.offsetY * diffH;
    console.log(`x: ${x} y: ${y}`);
}

function main()
{
    socket.emit("init_game");
    socket.on("render_packet", updatePacketHandler);
    socket.on("stat_update", statPacketHandler);
    socket.on("init_finished", () =>
    {
        const gameContainer = document.getElementsByClassName("gameContainer")[0];
        gameContainer.appendChild(renderer.canvas);
        renderer.attachEvent("mousedown", onMouseClick);
    });

}

window.onload = main;
