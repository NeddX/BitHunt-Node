const express = require("express");
const app = express();
const http = require("http");
const httpServer = http.createServer(app);
const socketIO = require("socket.io")(httpServer);
const path = require("path");
const game = require("./game_src/game");

let gameInstances = {};

app.use(express.static(path.join(__dirname, "public/")));
app.get("/", (req, res) => 
{
    res.sendFile(__dirname + "public/index.html");
});

socketIO.on("connection", (socket) => 
{
    console.log(`Client: '${socket.id}' connected!`);

    socket.on("init_game", (gameProperties) =>
    {
        let fps = 0;
		let lastUpdateTime = null;
		const gameInst = new game.Scene(
            socket,
            gameProperties.worldWidth, 
            gameProperties.worldHeight, 
            "#253140",
            gameProperties.pixelSize
        );
        let inst =
        {
            running: 1,
            gameInst: gameInst
        };
        gameInstances[socket.id.toString()] = inst;
        gameInst.init(
            gameProperties.grassCount,
            gameProperties.insectCount,
            gameProperties.predatorCount,
            gameProperties.tarantulaCount
        );
        socket.emit("init_finished");

		let latency = 50;
		const engineThread = setInterval(function updateThread()
		{
            if (inst.running == 1)
            {
			    const now = Date.now();
			    const deltaTime = lastUpdateTime ? (now - lastUpdateTime) / 1000 : 0;
			    lastUpdateTime = now;
                fps = Math.round(1 / deltaTime);
                gameInst.render();
			    gameInst.update();
                //process.stdout.write(`\rFPS: ${fps}     `);
            }
            else clearInterval(engineThread);
		}, latency);
    });

    socket.on("disconnect", () =>
    {
        console.log(`Client: ${socket.id} disconnected!`);
        let inst = gameInstances[socket.id.toString()];
        if (inst)
        {
            gameInstances[socket.id.toString()].running = 0;
            gameInstances[socket.id.toString()].gameInst.dispose();
            delete gameInstances[socket.id.toString()];
        }
    });
});
  
httpServer.listen(80, () => 
{
    console.log("listening on localhost:80");
});
