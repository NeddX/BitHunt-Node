const socket = io();

let renderer = null;

function fkrnd()
{	
	const WIDTH = 800;
	const HEIGHT = 800;
	const PIXEL_SIZE = 50;
	renderer.createCanvas(WIDTH, HEIGHT);
	renderer.backgroundColour("#253140");
	let x = 1;
	let y = 0;
	function update()
	{
		renderer.clear();
		/*if (x < WIDTH)
			x++;
		else
			x = 0;
		*/
		renderer.drawBit(x * PIXEL_SIZE, y * PIXEL_SIZE, "#ffffff", PIXEL_SIZE);
		window.requestAnimationFrame(update);
	}
	window.requestAnimationFrame(update);
}

function main()
{
    // Initialize the renderer
    renderer = new Renderer();
    if (false)
		socket.emit("init_game");
	else
		fkrnd();
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
