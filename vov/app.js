// ======================================
// DAW VOV
// FASE 1 — CORE RECORDER
// ======================================

const tracks =
document.getElementById("tracks");

const time =
document.getElementById("time");

// ======================================
// HTML
// ======================================

tracks.innerHTML = `

<div class="track">

    <div class="track-title">
    VOV RECORDER
    </div>

    <div class="track-buttons">

        <button id="rec">
        REC
        </button>

        <button id="stop">
        STOP
        </button>

        <button id="play">
        PLAY
        </button>

    </div>

    <audio
    id="audio"
    controls>
    </audio>

</div>

`;

// ======================================
// ELEMENTS
// ======================================

const recBtn =
document.getElementById("rec");

const stopBtn =
document.getElementById("stop");

const playBtn =
document.getElementById("play");

const audio =
document.getElementById("audio");

// ======================================
// AUDIO
// ======================================

let recorder = null;

let chunks = [];

let stream = null;

// ======================================
// CLOCK
// ======================================

let seconds = 0;

let interval = null;

function startClock(){

    clearInterval(interval);

    seconds = 0;

    interval = setInterval(()=>{

        seconds += 0.1;

        time.innerText =
        seconds.toFixed(1);

    },100);

}

function stopClock(){

    clearInterval(interval);

}

// ======================================
// REC
// ======================================

recBtn.onclick =
async ()=>{

    try{

        ////////////////////////////////////
        // RESET
        ////////////////////////////////////

        chunks = [];

        ////////////////////////////////////
        // MIC
        ////////////////////////////////////

        stream =
        await navigator
        .mediaDevices
        .getUserMedia({

            audio:true

        });

        ////////////////////////////////////
        // RECORDER
        ////////////////////////////////////

        recorder =
        new MediaRecorder(
            stream
        );

        ////////////////////////////////////
        // DATA
        ////////////////////////////////////

        recorder.ondataavailable =
        e=>{

            if(e.data.size > 0){

                chunks.push(
                    e.data
                );

            }

        };

        ////////////////////////////////////
        // STOP EVENT
        ////////////////////////////////////

        recorder.onstop =
        ()=>{

            ////////////////////////////////////
            // BLOB
            ////////////////////////////////////

            const blob =
            new Blob(
                chunks,
                {

                    type:"audio/webm"

                }
            );

            ////////////////////////////////////
            // URL
            ////////////////////////////////////

            const url =
            URL.createObjectURL(
                blob
            );

            ////////////////////////////////////
            // PLAYER
            ////////////////////////////////////

            audio.src = url;

            audio.load();

            ////////////////////////////////////
            // STOP MIC
            ////////////////////////////////////

            stream
            .getTracks()
            .forEach(
                t=>t.stop()
            );

            ////////////////////////////////////
            // VISUAL
            ////////////////////////////////////

            recBtn.style.background =
            "";

            console.log(
            "GRAVAÇÃO OK"
            );

        };

        ////////////////////////////////////
        // START
        ////////////////////////////////////

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

// ======================================
// STOP
// ======================================

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

// ======================================
// PLAY
// ======================================

playBtn.onclick =
async ()=>{

    try{

        if(!audio.src){

            alert(
            "Nada gravado"
            );

            return;

        }

        audio.currentTime = 0;

        await audio.play();

    }catch(err){

        console.log(err);

    }

};
