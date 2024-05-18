const songlist = [
    "Killer Arcadia", "Ambient Malaise", "Blue Moon HP", "Children of the Korn VI", "Plucky Suspense", "Reminiscence", "The Light is Here", "The Thirst Is Real"
]

const audio = document.getElementById("audio");

let audioContext;
let analyser;
let source;

const canvas = document.getElementById("visualiser");
const ctx = canvas.getContext("2d");

const devicePixelRatio = window.devicePixelRatio || 1;
const canvasWidth = canvas.clientWidth * devicePixelRatio;
const canvasHeight = canvas.clientHeight * devicePixelRatio;
canvas.width = canvasWidth;
canvas.height = canvasHeight;
ctx.scale(devicePixelRatio, devicePixelRatio);

let bufferLength;
let dataArray;

let g = 0;
let b = 0;

function playSongList() {
    const audioName = document.getElementById("audioName");
    let currentSongIndex = 0;

    function playNextSong() {
        currentSongIndex = (currentSongIndex + 1) % songlist.length;
        audio.src = `./audios/${songlist[currentSongIndex]}.mp3`;

        if (currentSongIndex > songlist.length) {
            console.log("This is the end; thanks for listening :)");
            currentSongIndex = 0;
        }

        audio.load();
        audio.addEventListener('canplaythrough', () => {
            audio.play().then(() => {
                audioName.innerText = songlist[currentSongIndex];
                console.log(songlist[currentSongIndex])
            }).catch(error => console.log("Error playing audio: ", error));
        }, { once: true })
    }

    audio.src = `./audios/${songlist[currentSongIndex]}.mp3`;
    audio.load();
    audio.addEventListener('canplaythrough', () => {
        audio.play().then(() => {
            audioName.innerText = songlist[currentSongIndex];
            console.log(songlist[currentSongIndex])
        }).catch(error => console.log("Error playing audio: ", error));
    }, { once: true })

    audio.addEventListener('ended', () => {
        playNextSong();
    });

    canvas.ondblclick = function() {
        audio.pause();
        playNextSong()
    };
}

function updateColor() {
    setInterval(() => {
        g = Math.floor(Math.random() * 256);
        b = Math.floor(Math.random() * 256);
    }, 3000);
}

function renderFrame() {
    requestAnimationFrame(renderFrame);

    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const barWidth = canvasWidth / bufferLength;
    const barSpacing = 1;

    for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 2;
        const x = i * (barWidth + barSpacing);
        const y = canvasHeight - barHeight;

        ctx.fillStyle = `rgba(${(barHeight + 100) * 1.5}, ${g}, ${b})`;
        ctx.fillRect(x, y, barWidth, barHeight);
    }
}

const playSection = document.getElementById("play-section");
const playBtn = document.getElementById("play-button");
const aboutSection = document.getElementById("about-section")

function startSymphony() {
    playBtn.addEventListener('click', () => {
        playSection.style.opacity = "0";
        playSection.addEventListener('transitionend', () => {
            playSection.style.display = "none";

            setTimeout(() => {
                aboutSection.style.opacity = "1";
                aboutSection.style.display = "block";

                if (!audioContext) {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    analyser = audioContext.createAnalyser();
                    
                    source = audioContext.createMediaElementSource(audio);
                    source.connect(analyser);
                    analyser.connect(audioContext.destination);

                    analyser.fftSize = 256;
                    bufferLength = analyser.frequencyBinCount;
                    dataArray = new Uint8Array(bufferLength);
                }

                audioContext.resume().then(() => {
                    playSongList();
                    updateColor();
                    renderFrame();
                })
            }, 2000)
        })
    })
}

const composerName = document.getElementById("composerName");
composerName.innerText = "Lyris Montrielle";

document.addEventListener('DOMContentLoaded', () => {
    document.body.style.animation = "fadeIn 5s forwards";
    startSymphony();
});
