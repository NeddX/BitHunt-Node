# Game of Life
Assignment project.

# Info
- Customize your simulation using The Editor.
- Interact with the game by selecting an element and clicking on the game canvas. Note that there's a cooldown between each interaction!
- See the current statistics, e.g., how many insects are alive at the current moment, and so on.
- Statistics get saved into a file called `stat.json` which is in the root folder.
- On each season a special occurence takes place, e.g., there's a chance that the grass might burn.

# Structure
Server side code is in `server.js`.
Game logic is at `game_src`.
Frontend logic is at `public`.

# Dependencies
Download all of the necessary dependencies for this to work!
- `npm i express`
- `npm i socket.io`
- `npm i zlib`

# Run
The main file is `server.js` so run it by typing `node server.js` into your shell.
The server listens on the port 80 so you can just type `localhost` in your browser and connect to it.

# Credit
- Relogic for the background pictures located in `public/assets/images`.
- The two unknown guys whom I stole the Nuke and Bomb pictures from.
- Data Realms and dbSoundworks for the music located in `public/assets/music`.
