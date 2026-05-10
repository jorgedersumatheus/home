// ======================================
// DAW VOV
// FASE 1 — RECORDER ESTÁVEL
// ======================================

const tracksDiv =
document.getElementById("tracks");

const addTrackBtn =
document.getElementById("addTrack");

const timeDisplay =
document.getElementById("time");

// ======================================
// GLOBAL
// ======================================

let trackCount = 0;

let timer = null;

let seconds = 0;

// ======================================
// CLOCK
// ======================================

function startClock(){

    clearInterval(timer);

    seconds = 0;

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

    trackCount++;

    //////////////////////////////////////////////////////
    // HTML
    //////////////////////////////////////////////////////

    const div =
    document.createElement("div");

    div.className = "track";

    div.innerHTML = `

    <div class="track-title">
    Track ${trackCount}
    </div>

    <div class="track-buttons">

        <button class="rec">
        REC
        </button>

        <button class="stop">
        STOP
        </button>

        <button class="play">
        PLAY
        </button>

        <button class="download">
        WAV
        </button>

        <button class="remove">
        X
        </button>

    </div>

    <audio controls></audio>

    `;

    tracksDiv.appendChild(div);

    //////////////////////////////////////////////////////
    // ELEMENTS
    //////////////////////////////////////////////////////

    const recBtn =
    div.querySelector(".rec");

    const stopBtn =
    div.querySelector(".stop");

    const playBtn =
    div.querySelector(".play");

    const downloadBtn =
    div.querySelector(".download");

    const removeBtn =
    div.querySelector(".remove");

    const audioEl =
    div.querySelector("audio");

    //////////////////////////////////////////////////////
    // AUDIO
    //////////////////////////////////////////////////////

    let recorder = null;

    let chunks = [];

    let blob = null;

    let url = null;

    let stream = null;

    //////////////////////////////////////////////////////
    // REC
    //////////////////////////////////////////////////////

    recBtn.onclick =
    async ()=>{

        try{

            //////////////////////////////////////////////////////
            // RESET
            //////////////////////////////////////////////////////

            chunks = [];

            //////////////////////////////////////////////////////
            // MIC
            //////////////////////////////////////////////////////

            stream =
            await navigator
            .mediaDevices
            .getUserMedia({

                audio:true

            });

            //////////////////////////////////////////////////////
            // RECORDER
            //////////////////////////////////////////////////////

            recorder =
            new MediaRecorder(
                stream
            );

            //////////////////////////////////////////////////////
            // DATA
            //////////////////////////////////////////////////////

            recorder.ondataavailable =
            e=>{

                if(e.data.size>0){

                    chunks.push(
                        e.data
                    );

                }

            };

            //////////////////////////////////////////////////////
            // STOP EVENT
            //////////////////////////////////////////////////////

            recorder.onstop =
            ()=>{

                //////////////////////////////////////////////////////
                // BLOB
                //////////////////////////////////////////////////////

                blob =
                new Blob(
                    chunks,
                    {

                        type:"audio/webm"

                    }
                );

                //////////////////////////////////////////////////////
                // URL
                //////////////////////////////////////////////////////

                url =
                URL.createObjectURL(
                    blob
                );

                //////////////////////////////////////////////////////
                // PLAYER
                //////////////////////////////////////////////////////

                audioEl.src =
                url;

                audioEl.load();

                //////////////////////////////////////////////////////
                // STOP MIC
                //////////////////////////////////////////////////////

                stream
                .getTracks()
                .forEach(
                    t=>t.stop()
                );

                //////////////////////////////////////////////////////
                // VISUAL
                //////////////////////////////////////////////////////

                recBtn.style.background =
                "";

                console.log(
                "TRACK READY"
                );

            };

            //////////////////////////////////////////////////////
            // START
            //////////////////////////////////////////////////////

            recorder.start();

            recBtn.style.background =
            "red";

            startClock();

            console.log(
            "REC START"
            );

        }catch(err){

            alert(
            "Erro microfone"
            );

            console.log(err);

        }

    };

    //////////////////////////////////////////////////////
    // STOP
    //////////////////////////////////////////////////////

    stopBtn.onclick =
    ()=>{

        if(
            recorder &&
            recorder.state ===
            "recording"
        ){

            recorder.stop();

        }

        stopClock();

    };

    //////////////////////////////////////////////////////
    // PLAY
    //////////////////////////////////////////////////////

    playBtn.onclick =
    async ()=>{

        try{

            if(!audioEl.src){

                alert(
                "Nada gravado"
                );

                return;

            }

            audioEl.currentTime = 0;

            await audioEl.play();

        }catch(err){

            console.log(err);

        }

    };

    //////////////////////////////////////////////////////
    // DOWNLOAD
    //////////////////////////////////////////////////////

    downloadBtn.onclick =
    ()=>{

        if(!blob){

            alert(
            "Nada gravado"
            );

            return;

        }

        const a =
        document
        .createElement("a");

        a.href =
        url;

        a.download =
        `VOV_TRACK_${trackCount}.webm`;

        a.click();

    };

    //////////////////////////////////////////////////////
    // REMOVE
    //////////////////////////////////////////////////////

    removeBtn.onclick =
    ()=>{

        audioEl.pause();

        div.remove();

    };

}

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
