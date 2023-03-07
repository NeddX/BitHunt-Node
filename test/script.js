const renderer = new Renderer();
const pixelSize = 8;
const centerX = 10;
const centerY = 10;
const radius = 5;

function drawCircle(renderer, x, y)
{
    renderer.renderRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    renderer.renderRect(x * pixelSize, (2 * centerY - y) * pixelSize, pixelSize, pixelSize);
    renderer.renderRect((2 * centerX - x) * pixelSize, y * pixelSize, pixelSize, pixelSize);
    renderer.renderRect((2 * centerX - x) * pixelSize, (2 * centerY - y) * pixelSize, pixelSize, pixelSize);
}

function kirkler()
{
	let x = 0;
	let y = radius;
	let d = 1 - radius;
while (x <= y)
{
    drawCircle(renderer, centerX + x, centerY + y);
    drawCircle(renderer, centerX + y, centerY + x);
    drawCircle(renderer, centerX - x, centerY + y);
    drawCircle(renderer, centerX - y, centerY + x);
    drawCircle(renderer, centerX + x, centerY - y);
    drawCircle(renderer, centerX + y, centerY - x);
    drawCircle(renderer, centerX - x, centerY - y);
    drawCircle(renderer, centerX - y, centerY - x);
    if (d < 0)
    {
        d += 2 * x + 3;
    }
    else
    {
        d += 2 * (x - y) + 5;
        y--;
    }
    x++;
}
}

function main()
{
	renderer.createCanvas(800, 800);
	renderer.setClearColour("#000000");
	renderer.clear();
	document.body.appendChild(renderer.canvas);
	
	kirkler();
	return;
	
	
	/*
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
	}
	*/
}
window.onload = main;