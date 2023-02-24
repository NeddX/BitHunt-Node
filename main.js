const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
const path = require("path");
const game = require("./game_data/game");

const PacketTypes =
{
    
};

let gameInstances = [];
let packetUpdate =
{
    type: 0
};

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
			renderCopy: function(x, y, colour, size = 8)
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

		const WIDTH = 100;
		const HEIGHT = 100;
		const PIXEL_SIZE = 8;

		socket.emit("create_canvas", 
		{   
			w: WIDTH * PIXEL_SIZE, h: HEIGHT * PIXEL_SIZE
		});
		socket.emit("clear_colour", "#253140");
        socket.emit("clear_call");
        
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
		
        let renderer = new game.GameRenderer(
            RenderFunctions.clear,
            RenderFunctions.background,
            RenderFunctions.renderCopy
        );
		let gameInstance = new game.Game(WIDTH, HEIGHT, PIXEL_SIZE, renderer);
        gameInstance.add(game.Grass, 10, 20);
		gameInstances.push(gameInstance);
		setInterval(function updateThread()
		{
			const now = Date.now();
			const deltaTime = lastUpdateTime ? (now - lastUpdateTime) / 1000 : 0;
			lastUpdateTime = now;
			
			gameInstance.__internalUpdate(deltaTime);
			
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
