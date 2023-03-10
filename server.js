const express = require("express");
const app = express();
const http = require("http");
const httpServer = http.createServer(app);
const socketIO = require("socket.io")(httpServer);
const path = require("path");
const game = require("./game_src/game");
const zlib = require("zlib");

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
            "#344459",
            gameProperties.pixelSize
        );
        gameInstances[socket.id.toString()] = gameInst;

        const entityDataBuffer = Buffer.from(Object.values(gameProperties.entityData));
        const entityData = zlib.inflateSync(entityDataBuffer).toString();
        gameInst.init(entityData);;

        socket.emit("init_finished");

        const engineThread = setInterval(function updateThread()
        {
            if (gameInst.run)
            {
                const now = Date.now();
                const deltaTime = lastUpdateTime ? (now - lastUpdateTime) / 1000 : 0;
                lastUpdateTime = now;
                fps = Math.round(1 / deltaTime);
                gameInst.update(deltaTime);
                //process.stdout.write(`\rfps: ${fps}     `);
            }
            else clearInterval(engineThread);
        }, 30);
    });

    socket.on("disconnect", () =>
    {
        console.log(`Client: ${socket.id} disconnected!`);
        let inst = gameInstances[socket.id.toString()];
        if (inst)
        {
            gameInstances[socket.id.toString()].run = false;
            gameInstances[socket.id.toString()].dispose();
            delete gameInstances[socket.id.toString()];
        }
    });
});

httpServer.listen(80, () => 
{
    console.log("listening on localhost:80");
});
