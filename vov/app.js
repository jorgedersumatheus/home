// ======================================
// DAW VOV PRO
// ENGINE ESTÁVEL MULTITRACK
// ======================================

const tracksDiv =
document.getElementById("tracks");

const addTrackBtn =
document.getElementById("addTrack");

const playBtn =
document.getElementById("play");

const stopBtn =
document.getElementById("stop");

const timeDisplay =
document.getElementById("time");

// ======================================
// GLOBAL
// ======================================

let tracks = [];

let micStream = null;

let seconds = 0;

let timer = null;

// ======================================
// INIT MIC
// ======================================

async function initMic(){

    if(micStream) return;

    try{

        micStream =
        await navigator
        .mediaDevices
        .getUserMedia({

            audio:{

                echoCancellation:false,
                noiseSuppression:false,
                autoGainControl:false

            }

        });

        console.log("MIC READY");

    }catch(err){

        alert(
        "Erro microfone"
        );

        console.log(err);

    }

}

// ======================================
// CLOCK
// ======================================

function startClock(){

    clearInterval(timer);

    timer = setInterval(()=>{

        seconds += 0.1;

        timeDisplay.innerText =
        seconds.toFixed(1);

    },100);

}

function stopClock(){

    clearInterval(timer);

}

// ======================================
// CREATE TRACK
// ======================================

function createTrack(){

    const track = {

        recorder:null,
        chunks:[],
        blob:null,
        url:null,
        audio:null,
        muted:false,
        solo:false,
        volume:1

    };

    const div =
    document.createElement("div");

    div.className = "track";

    div.innerHTML = `

    <div class="track-title">
    Track ${tracks.length+1}
    </div>

    <div class="track-buttons">

        <button class="rec">
        REC
        </button>

        <button class="playtrack">
        ▶
        </button>

        <button class="stoptrack">
        ■
        </button>

        <button class="mute">
        M
        </button>

        <button class="solo">
        S
        </button>

        <button class="wav">
        WAV
        </button>

        <button class="remove">
        X
        </button>

    </div>

    <input
    type="range"
    class="volume"
    min="0"
    max="1"
    step="0.01"
    value="1">

    <audio controls></audio>

    `;

    tracksDiv.appendChild(div);

    const recBtn =
    div.querySelector(".rec");

    const playTrackBtn =
    div.querySelector(".playtrack");

    const stopTrackBtn =
    div.querySelector(".stoptrack");

    const muteBtn =
    div.querySelector(".mute");

    const soloBtn =
    div.querySelector(".solo");

    const wavBtn =
    div.querySelector(".wav");

    const removeBtn =
    div.querySelector(".remove");

    const volumeSlider =
    div.querySelector(".volume");

    const audioEl =
    div.querySelector("audio");

    // ======================================
    // REC
    // ======================================

    recBtn.onclick =
    async ()=>{

        await initMic();

        if(!micStream){

            alert(
            "Microfone não disponível"
            );

            return;

        }

        if(
            track.recorder &&
            track.recorder.state ===
            "recording"
        ){

            return;

        }

        track.chunks = [];

        const recorder =
        new MediaRecorder(
            micStream
        );

        track.recorder =
        recorder;

        recorder.ondataavailable =
        e=>{

            if(e.data.size > 0){

                track.chunks.push(
                    e.data
                );

            }

        };

        recorder.onstop = ()=>{

            const blob =
            new Blob(
                track.chunks,
                {

                    type:"audio/webm"

                }
            );

            track.blob = blob;

            const url =
            URL.createObjectURL(
                blob
            );

            track.url = url;

            audioEl.src = url;

            track.audio =
            audioEl;

            track.audio.volume =
            track.volume;

            recBtn.style.background =
            "";

            console.log(
            "TRACK READY"
            );

        };

        recorder.start();

        recBtn.style.background =
        "red";

        startClock();

        console.log(
        "REC START"
        );

    };

    // ======================================
    // STOP TRACK
    // ======================================

    stopTrackBtn.onclick =
    ()=>{

        if(
            track.recorder &&
            track.recorder.state ===
            "recording"
        ){

            track.recorder.stop();

        }

        if(track.audio){

            track.audio.pause();

            track.audio.currentTime =
            0;

        }

        stopClock();

    };

    // ======================================
    // PLAY TRACK
    // ======================================

    playTrackBtn.onclick =
    async ()=>{

        if(!track.audio){

            alert(
            "Nada gravado"
            );

            return;

        }

        try{

            track.audio.currentTime =
            0;

            await track.audio.play();

        }catch(err){

            console.log(err);

        }

    };

    // ======================================
    // VOLUME
    // ======================================

    volumeSlider.oninput =
    e=>{

        track.volume =
        parseFloat(
            e.target.value
        );

        if(track.audio){

            track.audio.volume =
            track.volume;

        }

    };

    // ======================================
    // MUTE
    // ======================================

    muteBtn.onclick =
    ()=>{

        track.muted =
        !track.muted;

        muteBtn.style.background =
        track.muted
        ? "#900"
        : "";

        if(track.audio){

            track.audio.muted =
            track.muted;

        }

    };

    // ======================================
    // SOLO
    // ======================================

    soloBtn.onclick =
    ()=>{

        track.solo =
        !track.solo;

        soloBtn.style.background =
        track.solo
        ? "#aa7700"
        : "";

        updateSolo();

    };

    // ======================================
    // SOLO ENGINE
    // ======================================

    function updateSolo(){

        const soloTracks =
        tracks.filter(
            t=>t.solo
        );

        if(
            soloTracks.length===0
        ){

            tracks.forEach(t=>{

                if(t.audio){

                    t.audio.muted =
                    t.muted;

                }

            });

            return;

        }

        tracks.forEach(t=>{

            if(!t.audio) return;

            if(t.solo){

                t.audio.muted =
                false;

            }else{

                t.audio.muted =
                true;

            }

        });

    }

    // ======================================
    // EXPORT
    // ======================================

    wavBtn.onclick =
    ()=>{

        if(!track.blob){

            alert(
            "Nada gravado"
            );

            return;

        }

        const a =
        document
        .createElement("a");

        a.href =
        track.url;

        a.download =
        `VOV_TRACK_${Date.now()}.webm`;

        a.click();

    };

    // ======================================
    // REMOVE
    // ======================================

    removeBtn.onclick =
    ()=>{

        if(track.audio){

            track.audio.pause();

        }

        div.remove();

    };

    tracks.push(track);

}

// ======================================
// PLAY ALL
// ======================================

playBtn.onclick =
async ()=>{

    for(const track of tracks){

        if(track.audio){

            try{

                track.audio.currentTime =
                0;

                await track.audio.play();

            }catch(err){

                console.log(err);

            }

        }

    }

};

// ======================================
// STOP ALL
// ======================================

stopBtn.onclick =
()=>{

    tracks.forEach(track=>{

        if(track.audio){

            track.audio.pause();

            track.audio.currentTime =
            0;

        }

        if(
            track.recorder &&
            track.recorder.state ===
            "recording"
        ){

            track.recorder.stop();

        }

    });

    stopClock();

    seconds = 0;

    timeDisplay.innerText =
    "0.0";

};

// ======================================
// ADD TRACK
// ======================================

addTrackBtn.onclick =
()=>{

    createTrack();

};

// ======================================
// START
// ======================================

createTrack();
