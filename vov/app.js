// DAW VOV PRO — app.js // gravação estável por faixa // playback independente // mute / solo / WAV

const tracksContainer = document.getElementById('tracks'); const addTrackBtn = document.getElementById('addTrack'); const playAllBtn = document.getElementById('play'); const stopAllBtn = document.getElementById('stop'); const timeDisplay = document.getElementById('time');

let tracks = []; let globalTimer = null; let currentTime = 0;

function startClock() { clearInterval(globalTimer);

globalTimer = setInterval(() => {
    currentTime += 0.1;
    timeDisplay.innerText = currentTime.toFixed(1);
}, 100);

}

function stopClock() { clearInterval(globalTimer); }

function resetClock() { stopClock(); currentTime = 0; timeDisplay.innerText = '0.0'; }

function createTrack() {

const trackId = tracks.length + 1;

const track = {
    id: trackId,
    mediaRecorder: null,
    audioChunks: [],
    audioBlob: null,
    audioUrl: null,
    audio: null,
    stream: null,
    muted: false,
    solo: false,
    volume: 1
};

const trackDiv = document.createElement('div');
trackDiv.className = 'track';

trackDiv.innerHTML = `

    <div class="track-title">Track ${trackId}</div>

    <div class="track-buttons">
        <button class="rec-btn">REC</button>
        <button class="play-btn">▶</button>
        <button class="stop-btn">■</button>
        <button class="mute-btn">M</button>
        <button class="solo-btn">S</button>
        <button class="wav-btn">WAV</button>
        <button class="remove-btn">X</button>
    </div>

    <input type="range"
           class="volume"
           min="0"
           max="1"
           step="0.01"
           value="1">

    <audio controls class="audio-player"></audio>

`;

tracksContainer.appendChild(trackDiv);

const recBtn = trackDiv.querySelector('.rec-btn');
const playBtn = trackDiv.querySelector('.play-btn');
const stopBtn = trackDiv.querySelector('.stop-btn');
const muteBtn = trackDiv.querySelector('.mute-btn');
const soloBtn = trackDiv.querySelector('.solo-btn');
const wavBtn = trackDiv.querySelector('.wav-btn');
const removeBtn = trackDiv.querySelector('.remove-btn');
const volumeSlider = trackDiv.querySelector('.volume');
const audioPlayer = trackDiv.querySelector('.audio-player');

// =========================
// REC
// =========================

recBtn.onclick = async () => {

    try {

        // se já estiver gravando
        if (track.mediaRecorder && track.mediaRecorder.state === 'recording') {
            return;
        }

        track.audioChunks = [];

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: false
            }
        });

        track.stream = stream;

        const mediaRecorder = new MediaRecorder(stream);
        track.mediaRecorder = mediaRecorder;

        mediaRecorder.ondataavailable = e => {
            if (e.data.size > 0) {
                track.audioChunks.push(e.data);
            }
        };

        mediaRecorder.onstop = () => {

            const blob = new Blob(track.audioChunks, {
                type: 'audio/webm'
            });

            track.audioBlob = blob;

            const url = URL.createObjectURL(blob);
            track.audioUrl = url;

            audioPlayer.src = url;

            const audio = new Audio(url);
            audio.volume = track.volume;
            track.audio = audio;

            // encerra microfone
            if (track.stream) {
                track.stream.getTracks().forEach(t => t.stop());
            }

            recBtn.style.background = '';
        };

        mediaRecorder.start();

        recBtn.style.background = 'red';

        startClock();

    } catch (err) {
        alert('Erro ao acessar microfone');
        console.error(err);
    }
};

// =========================
// STOP
// =========================

stopBtn.onclick = () => {

    if (track.mediaRecorder && track.mediaRecorder.state === 'recording') {
        track.mediaRecorder.stop();
    }

    if (track.audio) {
        track.audio.pause();
        track.audio.currentTime = 0;
    }

    stopClock();
};

// =========================
// PLAY TRACK
// =========================

playBtn.onclick = () => {

    if (!track.audio) {
        return;
    }

    track.audio.volume = track.muted ? 0 : track.volume;

    track.audio.play();

    startClock();
};

// =========================
// VOLUME
// =========================

volumeSlider.oninput = e => {

    track.volume = parseFloat(e.target.value);

    if (track.audio && !track.muted) {
        track.audio.volume = track.volume;
    }
};

// =========================
// MUTE
// =========================

muteBtn.onclick = () => {

    track.muted = !track.muted;

    muteBtn.style.background = track.muted
        ? '#900'
        : '';

    if (track.audio) {
        track.audio.volume = track.muted
            ? 0
            : track.volume;
    }
};

// =========================
// SOLO
// =========================

soloBtn.onclick = () => {

    track.solo = !track.solo;

    soloBtn.style.background = track.solo
        ? '#aa7700'
        : '';

    updateSolo();
};

// =========================
// EXPORT WAV
// =========================

wavBtn.onclick = () => {

    if (!track.audioBlob) {
        alert('Nada gravado');
        return;
    }

    const link = document.createElement('a');

    link.href = track.audioUrl;
    link.download = `VOV_Track_${track.id}.webm`;

    link.click();
};

// =========================
// REMOVE
// =========================

removeBtn.onclick = () => {

    if (track.audio) {
        track.audio.pause();
    }

    trackDiv.remove();

    tracks = tracks.filter(t => t !== track);
};

tracks.push(track);

}

// ========================= // SOLO SYSTEM // =========================

function updateSolo() {

const soloTracks = tracks.filter(t => t.solo);

if (soloTracks.length === 0) {

    tracks.forEach(track => {
        if (track.audio) {
            track.audio.volume = track.muted
                ? 0
                : track.volume;
        }
    });

    return;
}

tracks.forEach(track => {

    if (!track.audio) {
        return;
    }

    if (track.solo) {
        track.audio.volume = track.volume;
    } else {
        track.audio.volume = 0;
    }
});

}

// ========================= // PLAY ALL // =========================

playAllBtn.onclick = () => {

tracks.forEach(track => {

    if (!track.audio) {
        return;
    }

    track.audio.currentTime = 0;

    if (track.muted) {
        track.audio.volume = 0;
    } else {
        track.audio.volume = track.volume;
    }

    track.audio.play();
});

startClock();

};

// ========================= // STOP ALL // =========================

stopAllBtn.onclick = () => {

tracks.forEach(track => {

    if (track.audio) {
        track.audio.pause();
        track.audio.currentTime = 0;
    }

    if (track.mediaRecorder && track.mediaRecorder.state === 'recording') {
        track.mediaRecorder.stop();
    }
});

resetClock();

};

// ========================= // ADD TRACK // =========================

addTrackBtn.onclick = () => { createTrack(); };

// primeira pista createTrack();
