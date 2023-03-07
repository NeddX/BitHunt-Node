const renderer = new Renderer();

function main()
{
	renderer.createCanvas(800, 800);
	renderer.setClearColour("#000000");
	renderer.clear();
	document.body.appendChild(renderer.canvas);
	
	const pixelSize = 8;
	const x1 = 10;
	const y1 = 10;
	const radius = 30;
	
	let i = radius * 0.5;
	for (let y = y1; y < y1 + radius; ++y)
	{
		for (let x = x1 + i; x < x1 + radius - i; ++x)
		{
			renderer.renderRect(
				x * pixelSize, 
				y * pixelSize, 
				pixelSize,
				pixelSize);
		}
	}
}
window.onload = main;