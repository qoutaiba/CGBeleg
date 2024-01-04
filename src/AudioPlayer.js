const canvas = document.getElementById("canvas");
const canvasCtx = canvas.getContext('2d');

class AudioPlayer {
    constructor(url) {
        this.isReady = false;
        this.isPlaying = false;
        if (!window.AudioContext) {  window.webkitAudioContext
            alert("Web Audio API not supported!");
            return;
        }
        this.audioCtx = new window.AudioContext();
        this.gainNode = this.audioCtx.createGain();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 512;

        this.bufferLength = this.analyser.frequencyBinCount/4;
        this.dataArray = new Uint8Array(this.bufferLength);
        this.analyser.getByteTimeDomainData(this.dataArray);
        this.gainNode.gain.value = 0.5;

        this.request = new XMLHttpRequest();
        this.request.open('GET', url, true);
        this.request.responseType = 'arraybuffer';

        this.request.onload = () => {
            this.receiveAudio();
        };
        this.request.send();
    }
    receiveAudio() {
        this.buffer = this.request.response;
        this.audioCtx.decodeAudioData(this.buffer).then(
            this.setBuffer.bind(this)
        );
    }
    setBuffer(decodedBuffer) {
        this.buffer = decodedBuffer;
        this.isReady = true;
    }
    onTogglePlay() {
        if (!this.isReady) return;
        this.isPlaying = !this.isPlaying;
        console.log("Music is now "+((this.isPlaying) ? "playing" : "stopped"));
        if (this.isPlaying) {
            this.bufferSource = this.audioCtx.createBufferSource();
            this.bufferSource.buffer = this.buffer;
            this.bufferSource.disconnect();
            this.bufferSource.connect(this.gainNode)
            this.gainNode.connect(this.analyser)
            this.analyser.connect(this.audioCtx.destination) ;
            this.bufferSource.start();
            this.visualizeData();
        } else {
            this.bufferSource.stop();
        }
    }
    barWidth = 15;
    barHeight ;
    x;
    visualizeData = () => {
        this.x = 0;
        canvasCtx.clearRect(0,0, canvas.width, canvas.height) ;
        this.analyser.getByteFrequencyData(this.dataArray)
        drawVisualizer(this.bufferLength, this.x, this.barWidth, this.barHeight, this.dataArray)
        requestAnimationFrame(this.visualizeData)
    };
}

function drawVisualizer (bufferLength, x, barWidth, barHeight, dataArray){
    for (let i =0 ; i<bufferLength; i++){
        barHeight =dataArray[i] + 1.5;
        canvasCtx.save();
        canvasCtx.translate(canvas.width/2, canvas.height/2)
        canvasCtx.rotate(Math.PI*dataArray[i]*0.088)
        canvasCtx.beginPath()
        canvasCtx.moveTo(0, barHeight)
        canvasCtx.lineTo(dataArray[i]/4, dataArray[i]/8)
        canvasCtx.stroke();
        const hue = i*0.5  ;
        canvasCtx.fillStyle =  'hsl(' + hue + ', 100%, 50%)' ;
        canvasCtx.fillRect(0,0, barWidth/6, barHeight/4);
        x+= barWidth;
        canvasCtx.restore()
    }
}

export default AudioPlayer;
