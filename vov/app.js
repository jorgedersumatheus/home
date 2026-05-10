const tracksContainer = document.getElementById("tracks");
const addTrackBtn = document.getElementById("addTrack");

const playAllBtn = document.getElementById("playAll");
const stopAllBtn = document.getElementById("stopAll");

const counter = document.getElementById("counter");
const playhead = document.getElementById("playhead");

//////////////////////////////////////////////////////
// AUDIO CONTEXT
//////////////////////////////////////////////////////

const audioContext = new (
window.AudioContext ||
window.webkitAudioContext
)();

//////////////////////////////////////////////////////
// GRID
//////////////////////////////////////////////////////

for(let i=1;i<=64;i++){

    const cell=document.createElement("div");

    cell.className="cell";

    cell.innerText=i;

    document
    .getElementById("grid")
    .appendChild(cell);
}

//////////////////////////////////////////////////////
// GLOBAL
//////////////////////////////////////////////////////

let tracks=[];

let playing=false;

let startTime=0;

let animationFrame;

//////////////////////////////////////////////////////
// PLAYHEAD
//////////////////////////////////////////////////////

function animate(){

    if(!playing) return;

    const now =
    audioContext.currentTime -
    startTime;

    counter.innerText =
    now.toFixed(1);

    playhead.style.left =
    (now*80)+"px";

    animationFrame =
    requestAnimationFrame(
        animate
    );
}

//////////////////////////////////////////////////////
// PLAY ALL
//////////////////////////////////////////////////////

playAllBtn.onclick=()=>{

    audioContext.resume();

    if(playing) return;

    playing=true;

    startTime=
    audioContext.currentTime;

    const soloTracks =
    tracks.filter(
        t=>t.solo
    );

    tracks.forEach(track=>{

        if(!track.audio.src) return;

        track.audio.pause();

        track.audio.currentTime=0;

        //////////////////////////////////////////////////////
        // SOLO
        //////////////////////////////////////////////////////

        if(soloTracks.length>0){

            if(track.solo){

                track.audio.play();

            }

        }else{

            //////////////////////////////////////////////////////
            // NORMAL
            //////////////////////////////////////////////////////

            if(!track.muted){

                track.audio.play();

            }

        }

    });

    animate();
};

//////////////////////////////////////////////////////
// STOP ALL
//////////////////////////////////////////////////////

stopAllBtn.onclick=()=>{

    playing=false;

    cancelAnimationFrame(
        animationFrame
    );

    counter.innerText="0.0";

    playhead.style.left="0px";

    tracks.forEach(track=>{

        track.audio.pause();

        track.audio.currentTime=0;

    });
};

//////////////////////////////////////////////////////
// CREATE TRACK
//////////////////////////////////////////////////////

addTrackBtn.onclick=createTrack;

function createTrack(){

    //////////////////////////////////////////////////////
    // TRACK HTML
    //////////////////////////////////////////////////////

    const track =
    document.createElement("div");

    track.className="track";

    track.innerHTML=`

    <div class="track-top">

        <div class="track-title">
        Track ${tracks.length+1}
        </div>

        <div class="controls">

            <button class="rec">
            REC
            </button>

            <button class="play">
            ▶
            </button>

            <button class="stop">
            ■
            </button>

            <button class="mute">
            M
            </button>

            <button class="solo">
            S
            </button>

            <button class="save">
            WAV
            </button>

            <button class="remove">
            X
            </button>

        </div>

        <input
        class="slider"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value="1">

        <div class="meter">
            <div class="fill"></div>
        </div>

        <audio controls></audio>

    </div>

    <div class="wave">

        <div class="clip">
        VOV Track
        </div>

    </div>

    `;

    tracksContainer
    .appendChild(track);

    //////////////////////////////////////////////////////
    // ELEMENTS
    //////////////////////////////////////////////////////

    const recBtn=
    track.querySelector(".rec");

    const playBtn=
    track.querySelector(".play");

    const stopBtn=
    track.querySelector(".stop");

    const muteBtn=
    track.querySelector(".mute");

    const soloBtn=
    track.querySelector(".solo");

    const saveBtn=
    track.querySelector(".save");

    const removeBtn=
    track.querySelector(".remove");

    const slider=
    track.querySelector(".slider");

    const fill=
    track.querySelector(".fill");

    const audio=
    track.querySelector("audio");

    //////////////////////////////////////////////////////
    // TRACK DATA
    //////////////////////////////////////////////////////

    const trackData={

        audio,
        muted:false,
        solo:false

    };

    tracks.push(trackData);

    //////////////////////////////////////////////////////
    // VOLUME
    //////////////////////////////////////////////////////

    slider.oninput=()=>{

        audio.volume=
        slider.value;

    };

    //////////////////////////////////////////////////////
    // RECORDER
    //////////////////////////////////////////////////////

    let mediaRecorder;

    let chunks=[];

    let currentStream;

    //////////////////////////////////////////////////////
    // REC
    //////////////////////////////////////////////////////

    recBtn.onclick = async () => {

        try {

            //////////////////////////////////////////////////////
            // MICROPHONE
            //////////////////////////////////////////////////////

            currentStream =
            await navigator
            .mediaDevices
            .getUserMedia({

                audio:true

            });

            //////////////////////////////////////////////////////
            // CLEAR
            //////////////////////////////////////////////////////

            chunks=[];

            //////////////////////////////////////////////////////
            // MIME FIX
            //////////////////////////////////////////////////////

            let options={};

            if(

                MediaRecorder
                .isTypeSupported(
                    "audio/webm;codecs=opus"
                )

            ){

                options={

                    mimeType:
                    "audio/webm;codecs=opus"

                };

            }else if(

                MediaRecorder
                .isTypeSupported(
                    "audio/webm"
                )

            ){

                options={

                    mimeType:
                    "audio/webm"

                };

            }else if(

                MediaRecorder
                .isTypeSupported(
                    "audio/mp4"
                )

            ){

                options={

                    mimeType:
                    "audio/mp4"

                };

            }

            //////////////////////////////////////////////////////
            // RECORDER
            //////////////////////////////////////////////////////

            mediaRecorder =
            new MediaRecorder(
                currentStream,
                options
            );

            console.log(
                "Recorder:",
                options
            );

            //////////////////////////////////////////////////////
            // DATA
            //////////////////////////////////////////////////////

            mediaRecorder
            .ondataavailable =
            e => {

                console.log(
                    "DATA:",
                    e.data.size
                );

                if(
                    e.data &&
                    e.data.size > 0
                ){

                    chunks.push(
                        e.data
                    );

                }
            };

            //////////////////////////////////////////////////////
            // STOP REC
            //////////////////////////////////////////////////////

            mediaRecorder
            .onstop = () => {

                console.log(
                    "STOP",
                    chunks.length
                );

                if(
                    chunks.length===0
                ){

                    alert(
                    "Nada gravado."
                    );

                    return;
                }

                //////////////////////////////////////////////////////
                // BLOB
                //////////////////////////////////////////////////////

                const blob =
                new Blob(chunks,{

                    type:
                    mediaRecorder
                    .mimeType
                    ||
                    "audio/webm"

                });

                //////////////////////////////////////////////////////
                // URL
                //////////////////////////////////////////////////////

                const url =
                URL
                .createObjectURL(
                    blob
                );

                //////////////////////////////////////////////////////
                // AUDIO
                //////////////////////////////////////////////////////

                audio.src = url;

                audio.load();

                //////////////////////////////////////////////////////
                // STOP STREAM
                //////////////////////////////////////////////////////

                currentStream
                .getTracks()
                .forEach(track=>{

                    track.stop();

                });

                //////////////////////////////////////////////////////
                // UI
                //////////////////////////////////////////////////////

                recBtn.classList
                .remove("active");

                fill.style.width="0%";

                console.log(
                "GRAVAÇÃO OK"
                );

            };

            //////////////////////////////////////////////////////
            // START
            //////////////////////////////////////////////////////

            mediaRecorder.start();

            recBtn.classList
            .add("active");

            console.log(
            "REC START"
            );

            //////////////////////////////////////////////////////
            // METER
            //////////////////////////////////////////////////////

            const source =
            audioContext
            .createMediaStreamSource(
                currentStream
            );

            const analyser =
            audioContext
            .createAnalyser();

            source.connect(
                analyser
            );

            const data =
            new Uint8Array(
            analyser
            .frequencyBinCount
            );

            function meter(){

                if(
                    !mediaRecorder ||
                    mediaRecorder
                    .state
                    !== "recording"
                ) return;

                analyser
                .getByteFrequencyData(
                    data
                );

                const avg =
                data.reduce(
                    (a,b)=>a+b,
                    0
                ) / data.length;

                fill.style.width =
                Math.min(avg,100)
                + "%";

                requestAnimationFrame(
                    meter
                );
            }

            meter();

        } catch(err){

            console.log(err);

            alert(
            "Erro microfone: "
            + err.message
            );
        }
    };

    //////////////////////////////////////////////////////
    // STOP
    //////////////////////////////////////////////////////

    stopBtn.onclick=()=>{

        //////////////////////////////////////////////////////
        // STOP RECORDER
        //////////////////////////////////////////////////////

        if(
            mediaRecorder &&
            mediaRecorder.state
            !== "inactive"
        ){

            mediaRecorder.stop();

        }

        //////////////////////////////////////////////////////
        // STOP AUDIO
        //////////////////////////////////////////////////////

        audio.pause();

        audio.currentTime=0;
    };

    //////////////////////////////////////////////////////
    // PLAY TRACK
    //////////////////////////////////////////////////////

    playBtn.onclick=()=>{

        if(audio.src){

            audio.currentTime=0;

            audio.play();

        }
    };

    //////////////////////////////////////////////////////
    // MUTE
    //////////////////////////////////////////////////////

    muteBtn.onclick=()=>{

        trackData.muted =
        !trackData.muted;

        audio.muted =
        trackData.muted;

        muteBtn.classList
        .toggle("active");
    };

    //////////////////////////////////////////////////////
    // SOLO
    //////////////////////////////////////////////////////

    soloBtn.onclick=()=>{

        trackData.solo =
        !trackData.solo;

        soloBtn.classList
        .toggle("active");
    };

    //////////////////////////////////////////////////////
    // EXPORT
    //////////////////////////////////////////////////////

    saveBtn.onclick=()=>{

        if(!audio.src){

            alert(
            "Nada gravado."
            );

            return;
        }

        const a =
        document
        .createElement("a");

        a.href=audio.src;

        a.download=
        "VOV_TRACK.webm";

        a.click();
    };

    //////////////////////////////////////////////////////
    // REMOVE
    //////////////////////////////////////////////////////

    removeBtn.onclick=()=>{

        audio.pause();

        track.remove();

        tracks =
        tracks.filter(
            t=>t!==trackData
        );
    };
}

//////////////////////////////////////////////////////
// START
//////////////////////////////////////////////////////

createTrack();
