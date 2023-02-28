const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const name = urlParams.get("nick");

let form = null;

function randomize()
{
    let width = form[0].value;
    let height = form[1].value;
    let size = 0;
    if (width == "" || height == "")
    {
        form[0].value = 100;
        form[1].value = 100;
        width = form[0].value;
        height = form[1].value;
    }
    size = width * height;

    form[2].value = Math.round(Math.random() * (size));
    form[3].value = Math.round(Math.random() * (size - form[2].value));
    form[4].value = Math.round(Math.random() * (size - form[3].value));
    form[5].value = Math.round(Math.random() * (size - form[4].value));
    form[6].value = Math.round(Math.random() * (size - form[5].value));
}

function main()
{
    const audioController = document.getElementById("audioController");
    audioController.volume = 0.3;

    form = document.getElementById("form");
    const map = new Map();
    
    let children = form.children;
    for (let i = 0; i < children.length; ++i) 
    {
        let child = children[i];
        if (form[i] && form[i].tagName.toLowerCase() == "input")
            console.log(`name: ${form[i].name} value: ${form[i].value}`);
    }
}
window.onload = main;