const tracksDiv =
document.getElementById("tracks");

const addTrackBtn =
document.getElementById("addTrack");

const playAllBtn =
document.getElementById("play");

const stopAllBtn =
document.getElementById("stop");

const time =
document.getElementById("time");

let tracks = [];

let timer = null;
let seconds = 0;

// =======================
// CLOCK
// =======================

function startClock(){

    clearInterval(timer);

    timer = setInterval(()=>{

        seconds += 0.1;

        time.innerText =
        seconds.toFixed(1);

    },100);

}

function stopClock(){

    clearInterval(timer);

}

// =======================
// TRACK
// =======================

function createTrack(){

    const track = {

        recorder:null,
        chunks:[],
        blob:null,
        url:null,
        audio:null,
        stream:null,
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

    const playBtn =
    div.querySelector(".playtrack");

    const stopBtn =
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

    // =======================
    // REC
    // =======================

    recBtn.onclick = async ()=>{

        try{

            if(
                track.recorder &&
                track.recorder.state ===
                "recording"
            ){
                return;
            }

            track.chunks = [];

            const stream =
            await navigator
            .mediaDevices
            .getUserMedia({

                audio:true

            });

            track.stream = stream;

            const recorder =
            new MediaRecorder(stream);

            track.recorder =
            recorder;

            recorder.ondataavailable =
            e=>{

                if(e.data.size>0){

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

                        type:
                        "audio/webm"

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
                new Audio(url);

                track.audio.volume =
                track.volume;

                stream
                .getTracks()
                .forEach(
                    t=>t.stop()
                );

                recBtn.style.background =
                "";

            };

            recorder.start();

            recBtn.style.background =
            "red";

            startClock();

        }catch(err){

            alert(
                "Falha microfone"
            );

            console.log(err);

        }

    };

    // =======================
    // STOP TRACK
    // =======================

    stopBtn.onclick = ()=>{

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

    // =======================
    // PLAY TRACK
    // =======================

    playBtn.onclick = async ()=>{

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

    // =======================
    // VOLUME
    // =======================

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

    // =======================
    // MUTE
    // =======================

    muteBtn.onclick = ()=>{

        track.muted =
        !track.muted;

        muteBtn.style.background =
        track.muted
        ? "#900"
        : "";

        if(track.audio){

            track.audio.volume =
            track.muted
            ? 0
            : track.volume;

        }

    };

    // =======================
    // SOLO
    // =======================

    soloBtn.onclick = ()=>{

        track.solo =
        !track.solo;

        soloBtn.style.background =
        track.solo
        ? "#aa7700"
        : "";

        updateSolo();

    };

    // =======================
    // WAV
    // =======================

    wavBtn.onclick = ()=>{

        if(!track.blob){

            alert(
                "Nada gravado"
            );

            return;

        }

        const a =
        document.createElement("a");

        a.href = track.url;

        a.download =
        `track-${Date.now()}.webm`;

        a.click();

    };

    // =======================
    // REMOVE
    // =======================

    removeBtn.onclick = ()=>{

        if(track.audio){

            track.audio.pause();

        }

        div.remove();

    };

    tracks.push(track);

}

// =======================
// SOLO ENGINE
// =======================

function updateSolo(){

    const solos =
    tracks.filter(
        t=>t.solo
    );

    if(solos.length===0){

        tracks.forEach(track=>{

            if(track.audio){

                track.audio.volume =
                track.muted
                ? 0
                : track.volume;

            }

        });

        return;

    }

    tracks.forEach(track=>{

        if(!track.audio){
            return;
        }

        if(track.solo){

            track.audio.volume =
            track.volume;

        }else{

            track.audio.volume =
            0;

        }

    });

}

// =======================
// PLAY ALL
// =======================

playAllBtn.onclick =
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

// =======================
// STOP ALL
// =======================

stopAllBtn.onclick =
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

    seconds = 0;

    time.innerText = "0.0";

    stopClock();

};

// =======================
// ADD TRACK
// =======================

addTrackBtn.onclick =
()=>{

    createTrack();

};

// primeira pista

createTrack();
