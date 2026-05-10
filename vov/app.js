const tracksDiv =
document.getElementById("tracks");

const addTrackBtn =
document.getElementById("addTrack");

const time =
document.getElementById("time");

let trackCount = 0;

// ======================================
// CLOCK
// ======================================

let seconds = 0;

let interval = null;

function startClock(){

    clearInterval(interval);

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
// CREATE TRACK
// ======================================

function createTrack(){

    trackCount++;

    ////////////////////////////////////////////////////
    // HTML
    ////////////////////////////////////////////////////

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

    ////////////////////////////////////////////////////
    // ELEMENTS
    ////////////////////////////////////////////////////

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

    ////////////////////////////////////////////////////
    // AUDIO ENGINE
    ////////////////////////////////////////////////////

    let recorder = null;

    let chunks = [];

    let stream = null;

    ////////////////////////////////////////////////////
    // REC
    ////////////////////////////////////////////////////

    recBtn.onclick =
    async ()=>{

        try{

            //////////////////////////////////////////////
            // RESET
            //////////////////////////////////////////////

            chunks = [];

            //////////////////////////////////////////////
            // MIC
            //////////////////////////////////////////////

            stream =
            await navigator
            .mediaDevices
            .getUserMedia({

                audio:true

            });

            //////////////////////////////////////////////
            // RECORDER
            //////////////////////////////////////////////

            recorder =
            new MediaRecorder(
                stream
            );

            //////////////////////////////////////////////
            // DATA
            //////////////////////////////////////////////

            recorder.ondataavailable =
            e=>{

                if(e.data.size>0){

                    chunks.push(
                        e.data
                    );

                }

            };

            //////////////////////////////////////////////
            // STOP EVENT
            //////////////////////////////////////////////

            recorder.onstop =
            ()=>{

                //////////////////////////////////////////////
                // BLOB
                //////////////////////////////////////////////

                const blob =
                new Blob(
                    chunks,
                    {

                        type:"audio/webm"

                    }
                );

                //////////////////////////////////////////////
                // URL
                //////////////////////////////////////////////

                const url =
                URL.createObjectURL(
                    blob
                );

                //////////////////////////////////////////////
                // PLAYER
                //////////////////////////////////////////////

                audio.src = url;

                audio.load();

                //////////////////////////////////////////////
                // STOP MIC
                //////////////////////////////////////////////

                stream
                .getTracks()
                .forEach(
                    t=>t.stop()
                );

                //////////////////////////////////////////////
                // VISUAL
                //////////////////////////////////////////////

                recBtn.style.background =
                "";

                console.log(
                "TRACK OK"
                );

            };

            //////////////////////////////////////////////
            // START
            //////////////////////////////////////////////

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

    ////////////////////////////////////////////////////
    // STOP
    ////////////////////////////////////////////////////

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

    ////////////////////////////////////////////////////
    // PLAY
    ////////////////////////////////////////////////////

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

    ////////////////////////////////////////////////////
    // REMOVE
    ////////////////////////////////////////////////////

    removeBtn.onclick =
    ()=>{

        audio.pause();

        track.remove();

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
