const Core = require("./bit_hunt/core/core");

const PacketTypes =
{
    CREATE_CANVAS:          0,
    DRAW_CALL:              1,
    CLEAR_CALL:             2,
    CLEAR_COLOUR_CALL:      3
};

function sendPacket(socket, packetType, data)
{	
	let packet =
	{
		type: packetType,
		data: data
	};
	socket.emit("update_packet", packet);
}

class GameInstance
{
    constructor(socket)
    {
        this.socket = socket;
        this.width = 100;
        this.height = 100;
        this.pixelSize = 8;
        this.clearColour = "#18233b";
        this.scene = new Core.Scene();
    }

    init()
    {
        sendPacket(this.socket, PacketTypes.CREATE_CANVAS,
        {
            w: this.width * this.pixelSize,
            h: this.height * this.pixelSize,
        });
        sendPacket(this.socket, PacketTypes.CLEAR_COLOUR_CALL, 
        {
            id: 0,
            colour: this.clearColour
        });
        sendPacket(this.socket, PacketTypes.CLEAR_CALL, 0);
    }

    update(deltaTime)
    {
        this.scene.update();
    }
}

module.exports = 
{
    GameInstance
};