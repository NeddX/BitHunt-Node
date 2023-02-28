const backgroundMusic = new Audio("assets/music/dBSoundworks/thisworld5.ogg");

function main()
{
    //backgroundMusic.volume = 0.3;
    backgroundMusic.loop = true;
    backgroundMusic.muted = true;
    //backgroundMusic.play();
}
window.onload = main;