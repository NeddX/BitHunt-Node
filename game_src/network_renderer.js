const runtime = require("v8");
const zlib = require("zlib");

class NetworkRenderer
{
    constructor(networkSocket, width, height)
    {
        this.width = width;
        this.height = height;
        this.socket = networkSocket;
        this.PacketType =
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
		this.batchRender = false;
        this.renderData = [];
    }

    sendPacket(packetType, data)
    {
        let packet =
        {
            type:   packetType,
            data:   data
        };
        if (!this.batchRender) this.socket.emit("render_update", packet);
        else this.renderData.push(packet);
    }

    init()
    {
        this.sendPacket(this.PacketType.CREATE_CANVAS, 
        {
            w: this.width,
            h: this.height
        });
    }

    clear()
    {
        this.sendPacket(this.PacketType.CLEAR_CALL);
    }

    renderRect(x, y, w, h, colour)
    {
        this.sendPacket(this.PacketType.RENDER_RECT, 
        {
            x:          x,
            y:          y,
            w:          w,
            h:          h,
            colour:     colour
        });
    }

    renderText(text, x, y, colour)
    {
        this.sendPacket(this.PacketType.RENDER_TEXT,
        {
            text:       text,
            x:          x,
            y:          y,
            colour:     colour
        });
    }

    backgroundColour(colour)
    {
        this.sendPacket(this.PacketType.CLEAR_COLOUR_CALL, 
        {
            colour: colour
        });
    }

    renderBegin()
    {
        this.renderData = [];
        this.batchRender = true;
    }

    renderEnd()
    {
        this.batchRender = false;
        const compressedData = zlib.deflateSync(JSON.stringify(this.renderData));
        let packet = 
        {
            data: compressedData
        };
        //process.stdout.write(`\rCompressed render data size: ${runtime.serialize(compressedPacket).byteLength}bytes`);
        //process.stdout.write(`\rRender data size: ${runtime.serialize(this.renderData).byteLength}bytes`);
        this.sendPacket(this.PacketType.BATCH_RENDER_END, packet);
        this.renderData = null;
    }

    dispose()
    {
        this.renderData = null;
        delete this;
    }
}

module.exports =
{
    NetworkRenderer
};
