import AudioPlayer from './AudioPlayer.js';
console.log("im here ")
let audioPlayer = new AudioPlayer("public/noNameNeeded.wav");
document.getElementById("audioPlayerControl").onclick = audioPlayer.onTogglePlay.bind(audioPlayer);






