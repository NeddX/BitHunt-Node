const socket = io();

// render must have only a single instance
let renderer = new Renderer();

function example()
{
    const P_WIDTH = 800;
    const P_HEIGHT = 800;
    const C_WIDTH = 400;
    const C_HEIGHT = 400;
    const C_PIXEL_SIZE = 8;

    let parentID = renderer.createCanvas(P_WIDTH, P_HEIGHT);
    let childID = renderer.createCanvas(C_WIDTH, C_HEIGHT);
    let parentCanvas = renderer.getCanvas(parentID);
    let childCanvas = renderer.getCanvas(childID);

    //renderer.attachCanvas(childID, parentID);

    parentCanvas.clearColour("blue");
    childCanvas.clearColour("white");
    parentCanvas.clear();
    childCanvas.clear();

    let x = 0, y = 0;
    function update()
    {
        x = (x < C_WIDTH) ? ++x : 0;

        childCanvas.clear();
        parentCanvas.clear();
        childCanvas.renderBit(x, y, "red", C_PIXEL_SIZE);
        parentCanvas.renderText(`x: ${x}, y: ${y}`,0, P_HEIGHT - 100, "black");

        window.requestAnimationFrame(update);
    }
    window.requestAnimationFrame(update);
}

function fkrnd()
{	
	const WIDTH = 100;
	const HEIGHT = 100;
	const PIXEL_SIZE = 8;

	let canvasID = renderer.createCanvas(WIDTH * PIXEL_SIZE, HEIGHT * PIXEL_SIZE);
    let canvas = renderer.getCanvas(canvasID);
	canvas.clearColour("#253140");
    canvas.clear();

	let x = 0;
	let y = 0;
	function update()
	{
		canvas.clear();
		if (x < WIDTH) x++;
		else x = 0;
        
        canvas.renderBit(x * PIXEL_SIZE, y * PIXEL_SIZE, "#ffffff", PIXEL_SIZE);
        canvas.renderText(`X: ${x}`, 30, 30);
        
		window.requestAnimationFrame(update);
	}
	window.requestAnimationFrame(update);
}

const PacketTypes =
{
    CREATE_CANVAS:          0,
    DRAW_CALL:              1,
    CLEAR_CALL:             2,
    CLEAR_COLOUR_CALL:      3
};

function updateHandler(packet)
{
    let data = packet.data;
    let id = (data.id != null) ? data.id : packet.data;
    switch (packet.type)
    {
        case PacketTypes.CREATE_CANVAS:
            renderer.createCanvas(data.w, data.h);
            break;
        case PacketTypes.DRAW_CALL:
            renderer.canvases[id].renderBit(
                data.x,
                data.y,
                data.colour,
                data.size
            );
            break;
        case PacketTypes.CLEAR_CALL:
            renderer.canvases[id].clear();
            break;
        case PacketTypes.CLEAR_COLOUR_CALL:
            renderer.canvases[id].clearColour(data.colour);
            break;
    }
}

function main()
{
    if (true) socket.emit("init_game");
	else example();
	
    socket.on("update_packet", updateHandler);
}

window.onload = main;
