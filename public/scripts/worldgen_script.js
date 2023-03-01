const backgroundMusic = new Audio("../assets/music/dbSoundworks/thisworld5_loop.ogg");
const templates =
[
    [ 0.5,  0.4,    0.05,   0.05    ],
    [ 0.2,  0.2,    0.5,   0.1      ],
    [ 0.3,  0.1,    0.1,   0.5      ],
    [ 0.7,  0.1,    0.1,   0.1      ]
];

let templateSelector    = null;
let form                = null;
let propertyFields = new Map();
propertyFields.set("worldWidth",       0);
propertyFields.set("worldHeight",      0);
propertyFields.set("grassCount",       0);
propertyFields.set("insectCount",      0);
propertyFields.set("tarantulaCount",   0);
propertyFields.set("predatorCount",    0);

function UpdateFormInputFields()
{
    const fields = form.querySelectorAll("input");
    fields.forEach(e => { e.value = propertyFields.get(e.name); });
}

function OnTemplateSelect(eventArgs)
{
    if (this.selectedIndex != 0)
    {
        const currentTemplate = templates[this.selectedIndex - 1];
        if (propertyFields.get("worldWidth") == 0 || propertyFields.get("worldHeight") == 0)
        {
            propertyFields.set("worldHeight",   100);
            propertyFields.set("worldWidth",    100);
            UpdateFormInputFields();
        }
        const size = propertyFields.get("worldWidth") * propertyFields.get("worldHeight");
        let lastSize = 0;
        let i = -2;
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
}

function OnInputTextChange(eventArgs)
{
    propertyFields[this.name] = parseInt(this.value);
}

function main()
{
    templateSelector = document.getElementById("templateSelector");
    templateSelector.addEventListener("change", OnTemplateSelect);

    form = document.querySelector("#form");
    const fields = form.querySelectorAll("input");
    fields.forEach(e => { e.addEventListener("change", OnInputTextChange); });

    UpdateFormInputFields();
	backgroundMusic.loop = true;
	backgroundMusic.volume = 0.3;
	backgroundMusic.play();
}
window.onload = main;