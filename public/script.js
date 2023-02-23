const socket = io();

function main()
{
    // Initialize the renderer
    let renderer = new Renderer();

    socket.emit("init_game");
    socket.on("update_packet", (packet) => 
    {
        let packetInfo = packet.split('|');
        switch (packetInfo[0])
        {
            case "create_canvas":
                renderer.createCanvas(parseInt(packetInfo[1]), parseInt(packetInfo[2]));
                break;
            case "draw_call":
                renderer.drawBit(
                    parseInt(packetInfo[1]), 
                    parseInt(packetInfo[2]), 
                    packetInfo[3]);
                break;
            case "clear_call":
                renderer.clear();
                break;
            case "backcolour":
                renderer.backgroundColour(packetInfo[1]);
                break;
        }
    });
}

window.onload = main;