let __b_rend__js_g__own_path = null;

function init() 
{
    __b_rend__js_g__own_path = document.currentScript.src.split("/").slice(0, -1).join("/") + '/';
}
init();

const __b_rend__js_internal_ns =
{
    Canvas: class
    {
        constructor(
            width, 
            height, 
            pixelSize, 
            clearColour,
            designerName)
        {
            this.id = 0;
            this.body = document.body;
            this.head = document.head;
            this.width = width;
            this.height = height;
            this.pixelSize = pixelSize;
            this.mClearColour = clearColour;
            this.isChild = false;
            this.canvas = document.createElement("canvas");
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.ctx = this.canvas.getContext("2d");
            this.ctx.fillStyle = this.clearColour;
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.canvas.classList.add("__b_rend__css_c__canvas");
            this.body.appendChild(this.canvas);
        }

        clear()
        {
            this.ctx.fillStyle = this.mClearColour;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        renderBit(x = 0, y = 0, colour = "#ffffff", size = this.pixelSize)
        {
            this.ctx.fillStyle = colour;
            this.ctx.fillRect(x, y, size, size);
        }

        renderText(text, x, y, colour = "#ffffff", font = "bold 24px Arial")
        {
            this.ctx.font = font;
            this.ctx.fillStyle = colour;
            this.ctx.fillText(text, x, y);
        }

        clearColour(colour)
        {
            this.mClearColour = colour;
            this.ctx.fillStyle = this.mClearColour;
        }

        attachTo(canvas)
        {
            this.body.removeChild(this.canvas);
            canvas.canvas.appendChild(this.canvas);
            //this.body.removeChild(this.container);
            //containerDiv.appendChild(this.canvas);
        }

        getID()
        {
            return this.id;
        }

        setPos(x, y)
        {
            //this.container.style.left = x.toString() + "px";
            //this.container.style.top = y.toString() + "px";
        }

        setAlignment(alignment)
        {
            // 0:   Centre
            // 1:   Top Left
            // 2:   Bottom Left
            // 3:   Top Right
            // 4:   Bottom Right
        }
    }
};

class Renderer
{
    constructor()
    {
        this.__body = document.body;
        this.__head = document.head;
        this.__canvases = [];
        this.__canvasDesigner = null;
        this.__appData = __b_rend__js_g__own_path;

        let link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = this.__appData + "/css/renderer_designer.css";
        this.__head.appendChild(link);
    }

    createCanvas(width = 128, height = 128, pixelSize = 32, clearColour = "#737373")
    {
        if (!this.__canvasDesigner)
        {
            for (let i = 0; i < document.styleSheets.length; ++i)
            {
                let path = document.styleSheets[i].href.split('/');
                if (path[path.length - 1] == "renderer_designer.css")
                {
                    this.__canvasDesigner = document.styleSheets[i];
                }
            }
        }

        let canvas = new __b_rend__js_internal_ns.Canvas(
            width, 
            height, 
            pixelSize, 
            clearColour,
            "__b_rend__css_c__container");
        this.__canvases.push(canvas);
        canvas.id = this.__canvases.length - 1;

        return canvas.id;
    }

    getCanvas(canvasId)
    {
        return this.__canvases[canvasId];
    }

    attachCanvas(childCanvasID, parentCanvasID)
    {
        let parent = this.__canvases[parentCanvasID];
        let child = this.__canvases[childCanvasID];
        child.attachTo(parent);
        //this.__canvases[childCanvasID].attachTo(this.__canvases[parentCanvasID]);
    }

    detachCanvas(childCanvasID, parentCanvasID)
    {
        // detach 
    }
}