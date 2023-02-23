let __b_rend__js_g__own_path = null;

function init() 
{
    __b_rend__js_g__own_path = document.currentScript.src.split("/").slice(0, -1).join("/") + '/';
}
init();

class Renderer
{
    constructor()
    {
        this.__width = 0;
        this.__height = 0;
        this.__body = document.body;
        this.__head = document.head;
        this.__canvas = null;
        this.__appData = __b_rend__js_g__own_path;
        this.__pixelSize = 0;
    }

    createCanvas(width = 128, height = 128, pixelSize = 32)
    {   
        this.__width = width;
        this.__height = height;
        this.__pixelSize = pixelSize;
        let link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = this.__appData + "/css/renderer_designer.css";
        this.__head.appendChild(link);
        this.__canvas = document.createElement("div");
        this.__canvas.className = "__b_rend__css_c__canvas";
        this.__canvas.style.width  = this.__width.toString() + "px";
        this.__canvas.style.height = this.__height.toString() + "px";
        this.__body.appendChild(this.__canvas);
    }

    drawBit(x = 0, y = 0, colour = "#ffffff", size = this.__pixelSize)
    {
        let pixel = document.createElement("div");
        pixel.className = "__b_rend__css_c__pixel";
        pixel.style.width = size.toString() + "px";
        pixel.style.height = size.toString() + "px";
        pixel.style.left = x.toString() + "px";
        pixel.style.top = y.toString() + "px";
        pixel.style.backgroundColor = colour;
        this.__canvas.appendChild(pixel);
    }

    clear()
    {
        while (this.__canvas.firstChild)
            this.__canvas.removeChild(this.__canvas.lastChild);
    }

    backgroundColour(hex = "#fffff")
    {
        this.__canvas.style.backgroundColor = hex;
    }
}
