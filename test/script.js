const renderer = new Renderer();
const pixelSize = 8;
const centerX = 10;
const centerY = 10;
const radius = 20;

function main()
{
	renderer.createCanvas(800, 800);
	renderer.setClearColour("#000000");
	renderer.clear();
	document.body.appendChild(renderer.canvas);
	
	let max = Math.round(radius * 0.16);
	let i = max;
	for (let y = 0; y < radius; ++y)
	{
		for (let x = i; x < radius - i; ++x)
		{
			renderer.renderRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize); 
		}
		
		
		if (radius - y - 1 <= max ) i++;
		else if (i > 0) i--;

        console.log(i);
	}
}
window.onload = main;