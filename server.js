const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
const path = require("path");
const game = require("./game_data/game");

let gameInstances = [];

app.use(express.static(path.join(__dirname, "public/")));

app.get("/", (req, res) => 
{
    res.sendFile(__dirname + "public/index.html");
});

io.on("connection", (socket) => 
{
    console.log("Connection is made!");

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

		let lastUpdateTime = null;
		let inst = new game.GameInstance(socket);
		inst.init();
		gameInstances.push(game);
		setInterval(function updateThread()
		{
			const now = Date.now();
			const deltaTime = lastUpdateTime ? (now - lastUpdateTime) / 1000 : 0;
			lastUpdateTime = now;
			inst.update(deltaTime);
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
