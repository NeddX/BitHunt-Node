const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
const path = require("path");
const game = require("./GameData/main");

let gameInstances = [];

app.use(express.static(path.join(__dirname, "public/")));

app.get("/", (req, res) => 
{
    res.sendFile(__dirname + "public/index.html");
});

io.on("connection", (socket) => 
{
    console.log("Connection is made!");

    let running = true;
    socket.on("init_game", () =>
    {
		const RenderFunctions =
		{
			clear: function()
			{	
				socket.emit("clear_call");
			},
			background: function(colour)
			{
				socket.emit("back_colour", colour);
			},
			renderCopy: function(x, y, colour, size)
			{
				//console.log(`(${x}, ${y}, ${colour}, ${size})`);
				
				socket.emit("draw_call", 
				{
					x: x,
					y: y,
					colour: colour,
					size: size
				});
				
			}
		};

		socket.emit("create_canvas", 
		{   
			w: 800, h: 800
		});
		socket.emit("back_colour", 
		{
			colour: "#253140"
		});
        
        let x = 0;
        let y = 0;
		let velocity = Math.random() * (50 - 10) + 10;

		let drawData =
		{
			x: 0,
			y: 0,
			colour: "#ffffff",
			size: 32
		};

		let lastUpdateTime = null;
		
		let gameInstance = new game.BitHunt(
			800, 
			800, 
			"#253140",
			RenderFunctions.clear,
			RenderFunctions.background,
			RenderFunctions.renderCopy);
		gameInstances.push(gameInstance);
		setInterval(function updateThread()
		{
			const now = Date.now();
			const deltaTime = lastUpdateTime ? (now - lastUpdateTime) / 1000 : 0;
			lastUpdateTime = now;
			
			gameInstance.update(deltaTime);
			
			//console.log("game objects: " + gameInstance.scWorld.objPool.size);
			
			/*
			if (x < 800 - 32) 
				x += velocity * deltaTime * 10;
			else
				x = 0;
			
			drawData.x = x;
			socket.emit("clear_call");
			socket.emit("draw_call", drawData);
			*/
			//console.clear();
			//console.log("delta: " + deltaTime);
				
		}, 5);
		
    });

    socket.on("disconnect", () =>
    {
        console.log("Client disconntected!");
        running = false;
    });
});
  
server.listen(80, () => 
{
    console.log("listening on localhost:80");
});
