const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
const path = require("path");

let players = [];

function sleep(millis) 
{
    return new Promise(resolve => setTimeout(resolve, millis));
}

function sendUpdate(socketObj, updateMsg)
{
    socketObj.emit("update_packet", updateMsg);
}

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
        sendUpdate(socket, "create_canvas|800|800");
        sendUpdate(socket, "backcolour|#253140");
        
        let x = 0;
        let y = 0;
        while (running)
        {
            //sendUpdate(socket, `draw_call|${x}|${y}|#ffffff`);
            x++;
        }
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