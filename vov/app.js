// ============================================
// DAW VOV
// TRACK ENGINE ESTÁVEL
// ============================================

const tracksDiv =
document.getElementById("tracks");

const addTrackBtn =
document.getElementById("addTrack");

const timeDisplay =
document.getElementById("time");

// ============================================
// TIMER
// ============================================

let seconds = 0;

let interval = null;

function startClock(){

    clearInterval(interval);

    seconds = 0;

    interval = setInterval(()=>{

        seconds += 0.1;

        timeDisplay.innerText =
        seconds.toFixed(1);

    },100);

}

function stopClock(){

    clearInterval(interval);

}

// ============================================
// TRACK COUNT
// ============================================

let trackCount = 0;

// ============================================
// CREATE TRACK
// ============================================

function createTrack(){

    trackCount++;

    /////////////////////////////////////////////
    // HTML
    /////////////////////////////////////////////

    const track =
    document.createElement("div");

    track.className = "track";

    track.innerHTML = `

    <div class="track-title">

    TRACK ${trackCount}

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

        <button class="remove">
        X
        </button>

    </div>

    <audio controls></audio>

    `;

    tracksDiv.appendChild(track);

    /////////////////////////////////////////////
    // ELEMENTS
    /////////////////////////////////////////////

    const recBtn =
    track.querySelector(".rec");

    const stopBtn =
    track.querySelector(".stop");

    const playBtn =
    track.querySelector(".play");

    const removeBtn =
    track.querySelector(".remove");

    const audio =
    track.querySelector("audio");

    /////////////////////////////////////////////
    // AUDIO
    /////////////////////////////////////////////

    let mediaRecorder = null;

    let chunks = [];

    let stream = null;

    let audioURL = null;

    /////////////////////////////////////////////
    // REC
    /////////////////////////////////////////////

    recBtn.onclick =
    async ()=>{

        try{

            /////////////////////////////////////////////
            // RESET
            /////////////////////////////////////////////

            chunks = [];

            /////////////////////////////////////////////
            // MIC
            /////////////////////////////////////////////

            stream =
            await navigator
            .mediaDevices
            .getUserMedia({

                audio:{
    echoCancellation:false,
    noiseSuppression:false,
    autoGainControl:true
}

            });

            /////////////////////////////////////////////
            // RECORDER
            /////////////////////////////////////////////

            mediaRecorder =
            new MediaRecorder(
                stream
            );

            /////////////////////////////////////////////
            // DATA
            /////////////////////////////////////////////

            mediaRecorder.ondataavailable =
            e=>{

                if(e.data.size>0){

                    chunks.push(
                        e.data
                    );

                }

            };

            /////////////////////////////////////////////
            // STOP EVENT
            /////////////////////////////////////////////

            mediaRecorder.onstop =
            ()=>{

                /////////////////////////////////////////////
                // BLOB
                /////////////////////////////////////////////

                const blob =
                new Blob(
                    chunks,
                    {

                        type:"audio/webm"

                    }
                );

                /////////////////////////////////////////////
                // URL
                /////////////////////////////////////////////

                audioURL =
                URL.createObjectURL(
                    blob
                );

                /////////////////////////////////////////////
                // PLAYER
                /////////////////////////////////////////////

                audio.src =
                audioURL;

                audio.load();

                /////////////////////////////////////////////
                // STOP MIC
                /////////////////////////////////////////////

                stream
                .getTracks()
                .forEach(
                    t=>t.stop()
                );

                /////////////////////////////////////////////
                // VISUAL
                /////////////////////////////////////////////

                recBtn.classList.remove(
"rec-recording"
);

                console.log(
                "TRACK READY"
                );

            };

            /////////////////////////////////////////////
            // START
            /////////////////////////////////////////////

            mediaRecorder.start();

            recBtn.classList.add(
"rec-recording"
);

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

    /////////////////////////////////////////////
    // STOP
    /////////////////////////////////////////////

    stopBtn.onclick =
    ()=>{

        if(
            mediaRecorder &&
            mediaRecorder.state ===
            "recording"
        ){

            mediaRecorder.stop();

        }

        stopClock();

    };

    /////////////////////////////////////////////
    // PLAY
    /////////////////////////////////////////////

    playBtn.onclick =
    async ()=>{

        try{

            if(!audioURL){

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

    /////////////////////////////////////////////
    // REMOVE
    /////////////////////////////////////////////

    removeBtn.onclick =
    ()=>{

        audio.pause();

        track.remove();

    };

}

// ============================================
// ADD TRACK
// ============================================

addTrackBtn.onclick =
()=>{

    createTrack();

};

// ============================================
// START
// ============================================

createTrack();
