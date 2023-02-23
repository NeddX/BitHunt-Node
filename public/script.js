const socket = io();

let renderer = null;

function main()
{
    // Initialize the renderer
    renderer = new Renderer();
    socket.emit("init_game");
	socket.on("draw_call", (drawData) =>
	{
		renderer.drawBit(
			drawData.x, 
			drawData.y, 
			drawData.colour,
			drawData.size);
	});
	socket.on("clear_call", () =>
	{
		renderer.clear();
	});
	socket.on("create_canvas", (canvasData) =>
	{
		renderer.createCanvas(
			canvasData.w,
			canvasData.h);
	});
	socket.on("back_colour", (colour) =>
	{
		renderer.backgroundColour(colour);
	});
}

window.onload = main;
