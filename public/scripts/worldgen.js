const backgroundMusic = new Audio("../assets/music/dbSoundworks/thisworld5.ogg");

function main()
{
	backgroundMusic.loop = true;
	backgroundMusic.volume = 0.3;
	backgroundMusic.play();
}
window.onload = main;