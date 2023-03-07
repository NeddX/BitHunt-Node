class Renderer
{
    constructor()
    {
        this.width = 0;
        this.height = 0;
        this.canvas = null;
        this.ctx = null;
    }

    createCanvas(width, height)
    {
        this.width = width;
        this.height = height;
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext("2d");
        this.ctx.fillStyle = this.clearColour;
        this.ctx.fillRect(0, 0, this.width, this.height);
        return this.canvas;
    }
    
    clear()
    {
        this.ctx.fillStyle = this.mClearColour;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    renderRect(x = 0, y = 0, w = 1, h = 1, colour = "#ffffff")
    {
        this.ctx.fillStyle = colour;
        this.ctx.fillRect(x, y, w, h);
    }

    renderText(text, x, y, colour = "#ffffff", font = "bold 24px Arial")
    {
        this.ctx.font = font;
        this.ctx.fillStyle = colour;
        this.ctx.fillText(text, x, y);
    }

    setClearColour(colour)
    {
        this.mClearColour = colour;
        this.ctx.fillStyle = this.mClearColour;
    }

    attachEvent(type, callbackFunction)
    {
        this.canvas.addEventListener(type, callbackFunction);
    }

    setID(id)
    {
        this.canvas.id = id;
    }

    addClassList(className)
    {
        this.canvas.classList.add(className);
    }
}