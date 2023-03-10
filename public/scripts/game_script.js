const socket = io();
const encoder = new TextEncoder();
const urlParams = new URLSearchParams(window.location.search);
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const PacketType =
{
    CREATE_CANVAS: 0,
    RENDER_RECT: 1,
    CLEAR_CALL: 2,
    CLEAR_COLOUR_CALL: 3,
    BATCH_RENDER_BEGIN: 4,
    BATCH_RENDER_END: 5,
    ATTACH_TO_CANVAS: 6,
    DETACH_CANVAS: 7,
    CANVAS_ALIGNMENT: 8,
    RENDER_TEXT: 9
};

const GElement =
{
    Radiation: 0,
    Virus: 1,
    Fire: 2,
    Bomb: 3
};

const GElementStr =
[
    "Radiation",
    "Virus",
    "Fire",
    "Small Bomb"
];

const Season =
{
    Autumn: 0,
    Winter: 1,
    Spring: 2,
    Summer: 3
};

const SeasonStr =
[
    "Autumn",
    "Winter",
    "Spring",
    "Summer"
];

const renderer = new Renderer();

const soundBank = new Map();
soundBank.set("background", new Audio("../assets/music/dBSoundworks/cc2g.ogg"));
soundBank.set("defeat", new Audio("../assets/music/dBSoundworks/udiedfinal.ogg"));
soundBank.set("deny", new Audio("../assets/sfx/death.wav"));
soundBank.set("nuke_explode_v0", new Audio("../assets/sfx/8bit_nuke_v0.wav"));
soundBank.set("nuke_explode_v1", new Audio("../assets/sfx/8bit_nuke_v1.wav"));
soundBank.set("nuke_explode_v2", new Audio("../assets/sfx/8bit_nuke_v2.wav"));
soundBank.set("nuke_explode_v3", new Audio("../assets/sfx/8bit_nuke_v3.wav"));
soundBank.set("nuke_drop", new Audio("../assets/sfx/8bit_wing_flap.wav"));
soundBank.set("fuse", new Audio("../assets/sfx/8bit_fuse_loop.wav"));
soundBank.set("explode", new Audio("../assets/sfx/8bit_explosion.wav"));
soundBank.set("click", new Audio("../assets/sfx/click.wav"));
const elementTimeout = 1000;

let activeElement = GElement.Bomb;
let frameCount = 0;
let onWait = false;
let fallout = false;
let gameCanvasContainer = null;
let run = true;
let fuseTime = 1500;

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
    if (onWait || !run)
    {
        soundBank.get("deny").play();
        return;
    }

    const mulX = renderer.canvas.width / renderer.canvas.offsetWidth;
    const mulY = renderer.canvas.height / renderer.canvas.offsetHeight;
    const x = Math.round(eventArgs.offsetX * mulX);
    const y = Math.round(eventArgs.offsetY * mulY);
    const mEventArgs =
    {
        x: x,
        y: y,
        element: activeElement
    };

    switch (activeElement)
    {
        case GElement.Bomb:
            {
                // perform a little nice animation
                soundBank.get("nuke_drop").play();
                soundBank.get("fuse").play();

                const cntr = document.getElementById("bombImgContainer");
                const img = document.getElementById("bombImg");
                cntr.style.transform = "rotate(0deg)";
                img.width = 50;
                img.height = 50;
                document.getElementById("bombImg").setAttribute("src", "../assets/images/bomb.png");

                const mY = eventArgs.clientY - (30 / 2);
                const mX = eventArgs.clientX - (50 / 2);
                let iY = mY - 400;

                cntr.style.top = mY;
                cntr.style.left = mX;
                cntr.style.opacity = 1;

                let speed = 1;

                onWait = true;
                function animation()
                {
                    if (iY != mY - 20)
                    {
                        iY += speed;
                        iY = clamp(iY, mY - 150, mY - 20);
                        cntr.style.top = iY;
                    }

                    speed += 0.8;

                    if (iY == mY - 20)
                    {
                        setTimeout(() => 
                        {
                            soundBank.get("fuse").pause();
                            soundBank.get("explode").play();
                            cntr.style.opacity = 0;
                            socket.emit("interactions_mouseDown", mEventArgs);
                            gameCanvasContainer.classList.add("genericShake");
                            setTimeout(() => 
                            {
                                gameCanvasContainer.classList.remove("genericShake");
                                onWait = false;
                            }, elementTimeout);
                        }, fuseTime);
                        return;
                    }

                    window.requestAnimationFrame(animation);
                }
                window.requestAnimationFrame(animation);
                break;
            }
        case GElement.Radiation:
            {
                // perform a little nice animation
                soundBank.get("nuke_drop").play();

                const cntr = document.getElementById("bombImgContainer");
                const img = document.getElementById("bombImg");
                cntr.style.transform = "rotate(90deg)";
                img.width = 50;
                img.height = 30;
                img.setAttribute("src", "../assets/images/nuke.png");

                const mY = eventArgs.clientY - (30 / 2);
                const mX = eventArgs.clientX - (50 / 2);
                let iY = mY - 400;

                cntr.style.top = mY;
                cntr.style.left = mX;
                cntr.style.opacity = 1;

                let rot = 90;
                let speed = 1;

                onWait = true;
                function animation()
                {
                    if (rot >= -90)
                    {
                        rot -= speed;
                        rot = clamp(rot, -90, 90);
                        cntr.style.transform = `rotate(${rot}deg)`;
                    }

                    if (iY != mY - 20)
                    {
                        iY += speed;
                        iY = clamp(iY, mY - 150, mY - 20);
                        cntr.style.top = iY;
                    }

                    speed += 0.8;

                    if (rot <= -90 && iY == mY - 20)
                    {
                        // flash
                        gameCanvasContainer.classList.add("genericShake");
                        renderer.canvas.style.opacity = 0;
                        cntr.style.opacity = 0;
                        soundBank.get("nuke_explode_v" + Math.round(Math.random() * 3).toString()).play();
                        setTimeout(() => 
                        {
                            socket.emit("interactions_mouseDown", mEventArgs);
                            renderer.canvas.style.opacity = 1;
                            setTimeout(() => { onWait = false; }, elementTimeout);
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
}

function onButtonClick(eventArgs)
{
    soundBank.get("click").play();

    setTimeout(() => 
    {
        if (eventArgs.srcElement.id == "radiationBtn")
            activeElement = GElement.Radiation;
        else if (eventArgs.srcElement.id == "bombBtn")
            activeElement = GElement.Bomb;
        else if (eventArgs.srcElement.id == "resetBtn")
            location.reload();
        else if (eventArgs.srcElement.id == "backBtn")
        {
            document.querySelector("#background")
                .querySelectorAll("img")
                .forEach(e => 
                {
                    e.style.transitionDuration = "0.3s";
                    e.style.opacity = 0;
                });
            setTimeout(() => 
            {
                window.location.href = "../html/worldgen.html";
            }, 300);
        }

        document.getElementById("elementIndicator").textContent = `Active element: ${GElementStr[activeElement]}`;
    }, 100);
}

function gameOver(reasoning)
{
    document.querySelector("#background")
        .querySelectorAll("img")
        .forEach(e => 
        {
            e.style.transitionDuration = "5s";
            e.style.opacity = 0;
        });

    renderer.clear();
    run = false;
    const music = soundBank.get("defeat");
    music.loop = false;
    music.play();
    soundBank.get("background").pause();
    setTimeout(() =>
    {
        const div = document.getElementById("endGameStuff");
        div.style.opacity = 1;
        setTimeout(() => 
        {
            const p = document.getElementById("endQuote");
            p.textContent = reasoning;
            p.style.opacity = 1;

            setTimeout(() => 
            {
                const btn = document.getElementsByClassName("endGameResetBtn")[0];
                btn.style.opacity = 1;
                div.style.pointerEvents = "all";
            }, 1000);
        }, 1500);
    }, 2000);
}

function soundInit()
{
    for (const [key, value] of soundBank)
        value.volume = 0.3;

    soundBank.get("deny").playbackRate = 1.6;
    soundBank.get("background").loop = true;
    soundBank.get("background").play();
    soundBank.get("nuke_drop").volume = 0.2;
    soundBank.get("fuse").loop = true;
    soundBank.get("fuse").volume = 0.2;
    soundBank.get("click").volume = 0.2;
}

function main()
{
    const jsonData = sessionStorage.getItem("entityData").toString();
    const entCompressed = pako.deflate(jsonData);

    socket.on("render_update", renderPacketHandler);
    socket.on("stat_update", statPacketHandler);
    socket.on("init_finished", () =>
    {
        gameCanvasContainer = document.getElementById("gameCanvasContainer");

        gameCanvasContainer.appendChild(renderer.canvas);
        renderer.setID("gameCanvas");
        renderer.attachEvent("mousedown", onMouseClick);

        soundInit();

        const buttons = document.getElementsByTagName("button");
        for (let i = 0; i < buttons.length; ++i)
            buttons[i].addEventListener("click", onButtonClick);
    });
    socket.on("season_change", (seasonID) => 
    {
        if (!fallout)
        {
            const img = document.getElementsByClassName(SeasonStr[seasonID].toLowerCase())[0];

            document.querySelector("#background")
                .querySelectorAll("img")
                .forEach(e => { e.style.opacity = 0; });

            img.style.opacity = 1;
        }
    });
    socket.on("nuclear_fallout", () =>
    {
        const img = document.getElementsByClassName("fallout")[0];
        fallout = true;
        document.querySelector("#background")
            .querySelectorAll("img")
            .forEach(e => { e.style.opacity = 0; });
        img.style.opacity = 1;
    });
    socket.on("game_over", (reasoning) =>
    {
        gameOver(reasoning);
    });

    socket.emit("init_game",
    {
        worldWidth:     urlParams.get("worldSize"),
        worldHeight:    urlParams.get("worldSize"),
        pixelSize:      8,
        entityData:     entCompressed
    });
}

window.onload = main;
