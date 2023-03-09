const renderer = new GLRenderer();

function main()
{
	renderer.createCanvas(800, 800);

	document.body.appendChild(renderer.canvas);
	
	renderer.setClearColour("#000000");
	renderer.clear();
	renderer.renderRect(400, 400, 30, 30, "#ffffff");
}
window.onload = main;