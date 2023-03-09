const renderer = new Renderer();
const backgroundMusic = new Audio("../assets/music/dbSoundworks/thisworld5.ogg");
const clickSfx = new Audio("../assets/sfx/click.wav");
const pixelSize = 8;
const templates =
    [
        // Grass,       Insect,     Tarantula,      Predator
        [0.08, 0.04, 0.01, 0.001],
        [0.05, 0.04, 0.001, 0.0005],
        [0.1, 0.03, 0.03, 0.001],
        [0.05, 0.05, 0.01, 0.03],
        [0.05, 0.01, 0.0, 0.0],
        [0.0, 0.0, 0.0, 0.0]
    ];

const Tags =
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

const Colours =
    [
        "#ffffff",
        "#32a846",
        "#c40017",
        "#f2ca35",
        "#000f4d",
    ];

let entities = [];
let templateSelector = null;
let form = null;
let gameCanvasContainer = null;
let propertyFields = new Map();
propertyFields.set("worldSize", 0);
propertyFields.set("grassCount", 0);
propertyFields.set("insectCount", 0);
propertyFields.set("tarantulaCount", 0);
propertyFields.set("predatorCount", 0);

function UpdateFormInputFields()
{
    const fields = form.querySelectorAll("input");
    fields.forEach(e => { e.value = propertyFields.get(e.name); });
    worldGen();
}

function OnTemplateSelect(eventArgs)
{
    const currentTemplate = templates[this.selectedIndex];
    if (propertyFields.get("worldSize") == 0)
    {
        propertyFields.set("worldSize", 100);
        UpdateFormInputFields();
    }
    const size = propertyFields.get("worldSize") * propertyFields.get("worldSize");
    let lastSize = 0;
    let i = -1;
    const newMap = new Map(propertyFields);
    for (const [key, value] of propertyFields)
    {
        if (i >= 0)
        {
            lastSize = Math.round(size * currentTemplate[i] / 1.0);//Math.round(Math.random() * ((size - lastSize) * currentTemplate[i] / 1.0));
            newMap.set(key, lastSize);
        }
        i++;
    }
    propertyFields = newMap;
    UpdateFormInputFields();
}

function OnInputTextChange(eventArgs)
{
    propertyFields.set(this.name, parseInt(this.value));
    worldGen();
}

function randomize()
{
    let max = Math.random() * (0.4 - 0.01) + 0.01;
    const currentTemplate = templates[templates.length - 1];
    for (let i = 0; i < currentTemplate.length; ++i)
    {
        currentTemplate[i] = Math.random() * max;
        max -= currentTemplate[i];
    }

    const size = propertyFields.get("worldSize") * propertyFields.get("worldSize");
    let lastSize = 0;
    let i = -1;
    const newMap = new Map(propertyFields);
    for (const [key, value] of propertyFields)
    {
        if (i >= 0)
        {
            lastSize = Math.round(size * currentTemplate[i] / 1.0);//Math.round(Math.random() * ((size - lastSize) * currentTemplate[i] / 1.0));
            newMap.set(key, lastSize);
        }
        i++;
    }
    propertyFields = newMap;
    UpdateFormInputFields();
}

function isEmpty(x, y)
{
    for (let i = 0; i < entities.length; ++i)
    {
        const data = entities[i];
        if (data.x == x && data.y == y)
            return false;
    }
    return true;
}

function worldGen()
{
    entities = [];

    const grassCount = propertyFields.get("grassCount");
    const insectCount = propertyFields.get("insectCount");
    const tarantulaCount = propertyFields.get("tarantulaCount");
    const predatorCount = propertyFields.get("predatorCount");
    const size = propertyFields.get("worldSize");

    gameCanvasContainer.removeChild(renderer.canvas);
    renderer.createCanvas(size * pixelSize, size * pixelSize);
    renderer.setClearColour("#344459");
    renderer.clear();
    gameCanvasContainer.appendChild(renderer.canvas);

    // Spawn Grass
    for (let i = 0; i < grassCount; ++i)
    {
        const data =
        {
            tag: Tags.Grass,
            x: Math.round(Math.random() * (size - 1)),
            y: Math.round(Math.random() * (size - 1)),
            w: pixelSize,
            h: pixelSize
        };
        if (isEmpty(data.x, data.y))
        {
            entities.push(data);
            renderer.renderRect(
                data.x * pixelSize,
                data.y * pixelSize,
                pixelSize,
                pixelSize,
                Colours[Tags.Grass]
            );
        }
        else i--;
    }

    // Spawn Insects
    for (let i = 0; i < insectCount; ++i)
    {
        const data =
        {
            tag: Tags.Insect,
            x: Math.round(Math.random() * (size - 1)),
            y: Math.round(Math.random() * (size - 1)),
            w: pixelSize,
            h: pixelSize
        };
        if (isEmpty(data.x, data.y))
        {
            entities.push(data);
            renderer.renderRect(
                data.x * pixelSize,
                data.y * pixelSize,
                pixelSize,
                pixelSize,
                Colours[Tags.Insect]
            );
        }
        else i--;
    }

    // Spawn Tarantulas
    for (let i = 0; i < tarantulaCount; ++i)
    {
        const data =
        {
            tag: Tags.Tarantula,
            x: Math.round(Math.random() * (size - 1)),
            y: Math.round(Math.random() * (size - 1)),
            w: pixelSize,
            h: pixelSize
        };
        if (isEmpty(data.x, data.y))
        {
            entities.push(data);
            renderer.renderRect(
                data.x * pixelSize,
                data.y * pixelSize,
                pixelSize,
                pixelSize,
                Colours[Tags.Tarantula]
            );
        }
        else i--;
    }

    // Spawn predators
    for (let i = 0; i < predatorCount; ++i)
    {
        const data =
        {
            tag: Tags.Predator,
            x: Math.round(Math.random() * (size - 1)),
            y: Math.round(Math.random() * (size - 1)),
            w: pixelSize,
            h: pixelSize
        };
        if (isEmpty(data.x, data.y))
        {
            entities.push(data);
            renderer.renderRect(
                data.x * pixelSize,
                data.y * pixelSize,
                pixelSize,
                pixelSize,
                Colours[Tags.Predator]
            );
        }
        else i--;
    }
}

function onButtonClick(eventArgs)
{
    clickSfx.play();
}

function main()
{
    gameCanvasContainer = document.getElementById("gameCanvasContainer");
    renderer.createCanvas(800, 800);
    renderer.setClearColour("#344459");
    renderer.clear();
    gameCanvasContainer.appendChild(renderer.canvas);

    templateSelector = document.getElementById("templateSelector");
    templateSelector.addEventListener("change", OnTemplateSelect);

    form = document.querySelector("#form");
    const fields = form.querySelectorAll("input");
    fields.forEach(e => { e.addEventListener("change", OnInputTextChange); });

    UpdateFormInputFields();
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;
    clickSfx.volume = 0.1;
    backgroundMusic.play();

    const buttons = document.getElementsByTagName("button");
    for (let i = 0; i < buttons.length; ++i)
        buttons[i].addEventListener("click", onButtonClick);

    // trigger fake event
    const changeEvent = new Event("change");
    templateSelector.dispatchEvent(changeEvent);
}
window.onload = main;
