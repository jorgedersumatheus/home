const tracksContainer = document.getElementById("tracks");
const playBtn = document.getElementById("play");
const stopBtn = document.getElementById("stop");
const timeDisplay = document.getElementById("time");

let tracks = [];
let playing = false;
let startTime = 0;
let animationFrame;

function updateClock() {
    if (!playing) return;

    let current = (Date.now() - startTime) / 1000;
    timeDisplay.innerText = current.toFixed(1);

    animationFrame = requestAnimationFrame(updateClock);
}

playBtn.onclick = () => {
    playing = true;
    startTime = Date.now();

    tracks.forEach(track => {
        if (track.audio.src && !track.muted) {
            track.audio.volume = track.soloMode ? 1 : track.volume.value;
            track.audio.play();
        }
    });

    updateClock();
};

stopBtn.onclick = () => {
    playing = false;

    cancelAnimationFrame(animationFrame);

    tracks.forEach(track => {
        track.audio.pause();
        track.audio.currentTime = 0;
    });

    timeDisplay.innerText = "0.0";
};

function createTrack() {

    const trackEl = document.createElement("div");
    trackEl.className = "track";

    const title = document.createElement("h3");
    title.innerText = `Track ${tracks.length + 1}`;

    const recBtn = document.createElement("button");
    recBtn.innerText = "REC";
    recBtn.className = "rec";

    const playTrack = document.createElement("button");
    playTrack.innerText = "▶";

    const stopTrack = document.createElement("button");
    stopTrack.innerText = "■";

    const muteBtn = document.createElement("button");
    muteBtn.innerText = "M";

    const soloBtn = document.createElement("button");
    soloBtn.innerText = "S";

    const exportBtn = document.createElement("button");
    exportBtn.innerText = "WAV";

    const removeBtn = document.createElement("button");
    removeBtn.innerText = "X";

    const volume = document.createElement("input");
    volume.type = "range";
    volume.min = 0;
    volume.max = 1;
    volume.step = 0.01;
    volume.value = 1;

    const meter = document.createElement("div");
    meter.className = "meter";

    const meterFill = document.createElement("div");
    meterFill.className = "meterFill";

    meter.appendChild(meterFill);

    const audio = document.createElement("audio");
    audio.controls = true;

    const clip = document.createElement("div");
    clip.className = "clip";
    clip.innerText = "VOV Track";

    trackEl.appendChild(title);
    trackEl.appendChild(recBtn);
    trackEl.appendChild(playTrack);
    trackEl.appendChild(stopTrack);
    trackEl.appendChild(muteBtn);
    trackEl.appendChild(soloBtn);
    trackEl.appendChild(exportBtn);
    trackEl.appendChild(removeBtn);
    trackEl.appendChild(volume);
    trackEl.appendChild(meter);
    trackEl.appendChild(audio);
    trackEl.appendChild(clip);

    tracksContainer.appendChild(trackEl);

    let mediaRecorder;
    let chunks = [];
    let stream;

    const trackData = {
        audio,
        volume,
        muted: false,
        soloMode: false
    };

    tracks.push(trackData);

    recBtn.onclick = async () => {

        try {

            stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                }
            });

            chunks = [];

            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = e => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {

                const blob = new Blob(chunks, {
                    type: "audio/webm"
                });

                const url = URL.createObjectURL(blob);

                audio.src = url;

                clip.style.width =
                    Math.max(audio.duration * 20, 120) + "px";

                stream.getTracks().forEach(track => track.stop());

                recBtn.style.background = "";
            };

            mediaRecorder.start();

            recBtn.style.background = "red";

        } catch (err) {

            alert("Erro no microfone: " + err);

            console.log(err);
        }
    };

    stopTrack.onclick = () => {

        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
        }

        audio.pause();
        audio.currentTime = 0;
    };

    playTrack.onclick = () => {
        audio.play();
    };

    volume.oninput = () => {
        audio.volume = volume.value;

        meterFill.style.width =
            (volume.value * 100) + "%";
    };

    muteBtn.onclick = () => {

        trackData.muted = !trackData.muted;

        audio.muted = trackData.muted;

        muteBtn.style.background =
            trackData.muted ? "#aa0000" : "";
    };

    soloBtn.onclick = () => {

        tracks.forEach(t => {
            t.soloMode = false;
        });

        trackData.soloMode = true;

        tracks.forEach(t => {

            if (t !== trackData) {
                t.audio.muted = true;
            } else {
                t.audio.muted = false;
            }
        });

        soloBtn.style.background = "#aa7700";
    };

    exportBtn.onclick = () => {

        if (!audio.src) return;

        const a = document.createElement("a");

        a.href = audio.src;
        a.download = `VOV_TRACK_${Date.now()}.webm`;

        a.click();
    };

    removeBtn.onclick = () => {

        trackEl.remove();

        tracks = tracks.filter(t => t !== trackData);
    };
}

document.getElementById("addTrack").onclick = createTrack;

createTrack();
