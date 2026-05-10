const tracksArea = document.getElementById("tracks");
const addTrackBtn = document.getElementById("addTrack");
const playBtn = document.getElementById("play");
const stopBtn = document.getElementById("stop");
const timeDisplay = document.getElementById("time");

let tracks = [];
let globalPlaying = false;
let timer = 0;
let interval = null;

// =========================
// CRIAR NOVA FAIXA
// =========================
function createTrack() {

    const track = {
        recorder: null,
        chunks: [],
        audioBlob: null,
        audioURL: null,
        audio: null,
        stream: null,
        gainNode: null,
        sourceNode: null,
        muted: false,
        solo: false
    };

    const div = document.createElement("div");
    div.className = "track";

    div.innerHTML = `
        <div class="track-title">VOV Track</div>

        <div class="track-buttons">
            <button class="rec">REC</button>
            <button class="playTrack">▶</button>
            <button class="stopTrack">■</button>
            <button class="mute">M</button>
            <button class="solo">S</button>
            <button class="wav">WAV</button>
            <button class="remove">X</button>
        </div>

        <input type="range" class="volume" min="0" max="1" step="0.01" value="1">

        <audio controls></audio>
    `;

    tracksArea.appendChild(div);

    const recBtn = div.querySelector(".rec");
    const playTrackBtn = div.querySelector(".playTrack");
    const stopTrackBtn = div.querySelector(".stopTrack");
    const muteBtn = div.querySelector(".mute");
    const soloBtn = div.querySelector(".solo");
    const wavBtn = div.querySelector(".wav");
    const removeBtn = div.querySelector(".remove");
    const volumeSlider = div.querySelector(".volume");
    const audioElement = div.querySelector("audio");

    track.audio = audioElement;

    // =========================
    // GRAVAR
    // =========================
    recBtn.onclick = async () => {

        try {

            if(track.recorder && track.recorder.state === "recording") {
                return;
            }

            track.chunks = [];

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                }
            });

            track.stream = stream;

            const recorder = new MediaRecorder(stream);
            track.recorder = recorder;

            recorder.ondataavailable = e => {
                if(e.data.size > 0) {
                    track.chunks.push(e.data);
                }
            };

            recorder.onstop = () => {

                const blob = new Blob(track.chunks, {
                    type: "audio/webm"
                });

                track.audioBlob = blob;
                track.audioURL = URL.createObjectURL(blob);

                audioElement.src = track.audioURL;
                audioElement.load();

                stream.getTracks().forEach(t => t.stop());

                recBtn.style.background = "darkred";
            };

            recorder.start();

            recBtn.style.background = "red";

        } catch(err) {
            alert("Erro no microfone: " + err.message);
            console.log(err);
        }
    };

    // =========================
    // PARAR GRAVAÇÃO
    // =========================
    stopTrackBtn.onclick = () => {

        if(track.recorder && track.recorder.state === "recording") {
            track.recorder.stop();
        }

        if(track.audio) {
            track.audio.pause();
            track.audio.currentTime = 0;
        }

        recBtn.style.background = "darkred";
    };

    // =========================
    // PLAY TRACK
    // =========================
    playTrackBtn.onclick = () => {

        if(track.audio && track.audio.src) {
            track.audio.volume = volumeSlider.value;
            track.audio.play();
        }
    };

    // =========================
    // VOLUME
    // =========================
    volumeSlider.oninput = () => {

        if(track.audio) {
            track.audio.volume = volumeSlider.value;
        }
    };

    // =========================
    // MUTE
    // =========================
    muteBtn.onclick = () => {

        track.muted = !track.muted;

        if(track.audio) {
            track.audio.muted = track.muted;
        }

        muteBtn.style.background = track.muted
            ? "#444"
            : "#222";
    };

    // =========================
    // SOLO
    // =========================
    soloBtn.onclick = () => {

        track.solo = !track.solo;

        tracks.forEach(t => {

            if(t !== track && t.audio) {
                t.audio.muted = track.solo;
            }
        });

        soloBtn.style.background = track.solo
            ? "goldenrod"
            : "#222";
    };

    // =========================
    // EXPORTAR WAV
    // =========================
    wavBtn.onclick = () => {

        if(!track.audioBlob) {
            alert("Nenhum áudio gravado");
            return;
        }

        const a = document.createElement("a");
        a.href = track.audioURL;
        a.download = "VOV_Track.wav";
        a.click();
    };

    // =========================
    // REMOVER TRACK
    // =========================
    removeBtn.onclick = () => {

        if(track.audio) {
            track.audio.pause();
        }

        div.remove();

        tracks = tracks.filter(t => t !== track);
    };

    tracks.push(track);
}

// =========================
// PLAY GERAL
// =========================
playBtn.onclick = () => {

    globalPlaying = true;

    tracks.forEach(track => {

        if(track.audio && track.audio.src) {

            track.audio.volume = track.audio.parentElement
                .querySelector(".volume").value;

            track.audio.play();
        }
    });

    clearInterval(interval);

    interval = setInterval(() => {
        timer += 0.1;
        timeDisplay.innerText = timer.toFixed(1);
    }, 100);
};

// =========================
// STOP GERAL
// =========================
stopBtn.onclick = () => {

    globalPlaying = false;

    tracks.forEach(track => {

        if(track.audio) {
            track.audio.pause();
            track.audio.currentTime = 0;
        }
    });

    clearInterval(interval);

    timer = 0;
    timeDisplay.innerText = "0.0";
};

// =========================
// NOVA TRACK
// =========================
addTrackBtn.onclick = createTrack;

// PRIMEIRA TRACK
createTrack();
