const tracks =
document.getElementById("tracks");

const time =
document.getElementById("time");

let recorder;
let chunks = [];
let stream;

//////////////////////////////////////////////////////
// TRACK
//////////////////////////////////////////////////////

const div =
document.createElement("div");

div.className = "track";

div.innerHTML = `

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

<audio id="audio" controls></audio>

`;

tracks.appendChild(div);

//////////////////////////////////////////////////////
// ELEMENTS
//////////////////////////////////////////////////////

const recBtn =
document.getElementById("rec");

const stopBtn =
document.getElementById("stop");

const playBtn =
document.getElementById("play");

const audio =
document.getElementById("audio");

//////////////////////////////////////////////////////
// TIMER
//////////////////////////////////////////////////////

let sec = 0;

let interval;

function startClock(){

    clearInterval(interval);

    sec = 0;

    interval = setInterval(()=>{

        sec += 0.1;

        time.innerText =
        sec.toFixed(1);

    },100);

}

function stopClock(){

    clearInterval(interval);

}

//////////////////////////////////////////////////////
// REC
//////////////////////////////////////////////////////

recBtn.onclick =
async ()=>{

    try{

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
        // RESET
        //////////////////////////////////////////////////////

        chunks = [];

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

            const blob =
            new Blob(
                chunks,
                {

                    type:"audio/webm"

                }
            );

            const url =
            URL.createObjectURL(
                blob
            );

            audio.src = url;

            audio.load();

            //////////////////////////////////////////////////////
            // STOP MIC
            //////////////////////////////////////////////////////

            stream
            .getTracks()
            .forEach(
                t=>t.stop()
            );

            console.log(
            "GRAVADO"
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
        err.message
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

    recBtn.style.background =
    "";

    stopClock();

};

//////////////////////////////////////////////////////
// PLAY
//////////////////////////////////////////////////////

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
