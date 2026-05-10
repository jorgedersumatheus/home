//////////////////////////////////////////////////////
// DAW VOV PRO
// ENGINE PCM + WAV REAL
//////////////////////////////////////////////////////

const tracksContainer =
document.getElementById("tracks");

const addTrackBtn =
document.getElementById("addTrack");

//////////////////////////////////////////////////////
// AUDIO CONTEXT
//////////////////////////////////////////////////////

const audioContext =
new (
window.AudioContext ||
window.webkitAudioContext
)();

//////////////////////////////////////////////////////
// TRACKS
//////////////////////////////////////////////////////

let tracks = [];

//////////////////////////////////////////////////////
// CREATE TRACK
//////////////////////////////////////////////////////

function createTrack(){

    //////////////////////////////////////////////////////
    // HTML
    //////////////////////////////////////////////////////

    const track =
    document.createElement("div");

    track.className = "track";

    track.innerHTML = `

    <div class="track-top">

        <div class="track-title">
        Track ${tracks.length + 1}
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

    const recBtn =
    track.querySelector(".rec");

    const playBtn =
    track.querySelector(".play");

    const stopBtn =
    track.querySelector(".stop");

    const muteBtn =
    track.querySelector(".mute");

    const soloBtn =
    track.querySelector(".solo");

    const saveBtn =
    track.querySelector(".save");

    const removeBtn =
    track.querySelector(".remove");

    const slider =
    track.querySelector(".slider");

    const fill =
    track.querySelector(".fill");

    const audio =
    track.querySelector("audio");

    //////////////////////////////////////////////////////
    // AUDIO DATA
    //////////////////////////////////////////////////////

    let stream;

    let input;

    let processor;

    let recording = false;

    let buffers = [];

    let wavBlob = null;

    let muted = false;

    //////////////////////////////////////////////////////
    // VOLUME
    //////////////////////////////////////////////////////

    slider.oninput = () => {

        audio.volume =
        slider.value;

    };

    //////////////////////////////////////////////////////
    // REC
    //////////////////////////////////////////////////////

    recBtn.onclick = async () => {

        try {

            //////////////////////////////////////////////////////
            // RESUME CONTEXT
            //////////////////////////////////////////////////////

            if(
                audioContext.state ===
                "suspended"
            ){

                await audioContext.resume();

            }

            //////////////////////////////////////////////////////
            // GET MIC
            //////////////////////////////////////////////////////

            stream =
            await navigator
            .mediaDevices
            .getUserMedia({

                audio:{

                    echoCancellation:false,
                    noiseSuppression:false,
                    autoGainControl:false

                }

            });

            //////////////////////////////////////////////////////
            // SOURCE
            //////////////////////////////////////////////////////

            input =
            audioContext
            .createMediaStreamSource(
                stream
            );

            //////////////////////////////////////////////////////
            // PROCESSOR
            //////////////////////////////////////////////////////

            processor =
            audioContext
            .createScriptProcessor(
                2048,
                1,
                1
            );

            //////////////////////////////////////////////////////
            // RESET
            //////////////////////////////////////////////////////

            buffers = [];

            recording = true;

            recBtn.style.background =
            "red";

            //////////////////////////////////////////////////////
            // CONNECT
            //////////////////////////////////////////////////////

            input.connect(processor);

            processor.connect(
                audioContext.destination
            );

            //////////////////////////////////////////////////////
            // PROCESS AUDIO
            //////////////////////////////////////////////////////

            processor.onaudioprocess =
            (e) => {

                if(!recording) return;

                const inputData =
                e.inputBuffer
                .getChannelData(0);

                //////////////////////////////////////////////////////
                // COPY BUFFER
                //////////////////////////////////////////////////////

                const copy =
                new Float32Array(
                    inputData.length
                );

                copy.set(inputData);

                buffers.push(copy);

                //////////////////////////////////////////////////////
                // METER
                //////////////////////////////////////////////////////

                let peak = 0;

                for(
                    let i=0;
                    i<inputData.length;
                    i++
                ){

                    const v =
                    Math.abs(inputData[i]);

                    if(v > peak){

                        peak = v;

                    }

                }

                fill.style.width =
                (peak * 100) + "%";

            };

            console.log(
            "REC START OK"
            );

        } catch(err){

            console.log(err);

            alert(
            "Erro: " + err.message
            );

        }

    };

    //////////////////////////////////////////////////////
    // STOP
    //////////////////////////////////////////////////////

    stopBtn.onclick = () => {

        //////////////////////////////////////////////////////
        // STOP PLAYBACK
        //////////////////////////////////////////////////////

        audio.pause();

        audio.currentTime = 0;

        //////////////////////////////////////////////////////
        // STOP REC
        //////////////////////////////////////////////////////

        if(!recording) return;

        recording = false;

        recBtn.style.background = "";

        fill.style.width = "0%";

        //////////////////////////////////////////////////////
        // DISCONNECT
        //////////////////////////////////////////////////////

        processor.disconnect();

        input.disconnect();

        stream
        .getTracks()
        .forEach(
            t=>t.stop()
        );

        //////////////////////////////////////////////////////
        // MERGE PCM
        //////////////////////////////////////////////////////

        let length = 0;

        buffers.forEach(
            b=>length += b.length
        );

        const merged =
        new Float32Array(length);

        let offset = 0;

        buffers.forEach(buffer=>{

            merged.set(
                buffer,
                offset
            );

            offset += buffer.length;

        });

        //////////////////////////////////////////////////////
        // WAV
        //////////////////////////////////////////////////////

        wavBlob =
        encodeWAV(
            merged,
            audioContext.sampleRate
        );

        //////////////////////////////////////////////////////
        // URL
        //////////////////////////////////////////////////////

        const url =
        URL.createObjectURL(
            wavBlob
        );

        audio.src = url;

        audio.load();

        console.log(
        "WAV READY"
        );

    };

    //////////////////////////////////////////////////////
    // PLAY
    //////////////////////////////////////////////////////

    playBtn.onclick = () => {

        if(audio.src){

            audio.play();

        }else{

            alert(
            "Nada gravado."
            );

        }

    };

    //////////////////////////////////////////////////////
    // MUTE
    //////////////////////////////////////////////////////

    muteBtn.onclick = () => {

        muted = !muted;

        audio.muted = muted;

        muteBtn.style.background =
        muted
        ? "#aa0000"
        : "";

    };

    //////////////////////////////////////////////////////
    // SOLO
    //////////////////////////////////////////////////////

    soloBtn.onclick = () => {

        tracks.forEach(t=>{

            if(
                t.audio !== audio
            ){

                t.audio.muted = true;

            }

        });

        audio.muted = false;

        soloBtn.style.background =
        "#cc8800";

    };

    //////////////////////////////////////////////////////
    // EXPORT WAV
    //////////////////////////////////////////////////////

    saveBtn.onclick = () => {

        if(!wavBlob){

            alert(
            "Nada gravado."
            );

            return;
        }

        const a =
        document
        .createElement("a");

        a.href =
        URL.createObjectURL(
            wavBlob
        );

        a.download =
        "VOV_TRACK.wav";

        a.click();

    };

    //////////////////////////////////////////////////////
    // REMOVE
    //////////////////////////////////////////////////////

    removeBtn.onclick = () => {

        audio.pause();

        track.remove();

    };

    //////////////////////////////////////////////////////
    // SAVE TRACK
    //////////////////////////////////////////////////////

    tracks.push({

        audio

    });

}

//////////////////////////////////////////////////////
// WAV ENCODER
//////////////////////////////////////////////////////

function encodeWAV(
samples,
sampleRate
){

    const buffer =
    new ArrayBuffer(
        44 + samples.length * 2
    );

    const view =
    new DataView(buffer);

    //////////////////////////////////////////////////////
    // HEADER
    //////////////////////////////////////////////////////

    writeString(view,0,"RIFF");

    view.setUint32(
        4,
        36 + samples.length * 2,
        true
    );

    writeString(view,8,"WAVE");

    writeString(view,12,"fmt ");

    view.setUint32(16,16,true);

    view.setUint16(20,1,true);

    view.setUint16(22,1,true);

    view.setUint32(
        24,
        sampleRate,
        true
    );

    view.setUint32(
        28,
        sampleRate * 2,
        true
    );

    view.setUint16(32,2,true);

    view.setUint16(34,16,true);

    writeString(view,36,"data");

    view.setUint32(
        40,
        samples.length * 2,
        true
    );

    //////////////////////////////////////////////////////
    // PCM
    //////////////////////////////////////////////////////

    floatTo16BitPCM(
        view,
        44,
        samples
    );

    return new Blob(
        [view],
        {type:"audio/wav"}
    );

}

//////////////////////////////////////////////////////
// STRING
//////////////////////////////////////////////////////

function writeString(
view,
offset,
string
){

    for(
        let i=0;
        i<string.length;
        i++
    ){

        view.setUint8(
            offset + i,
            string.charCodeAt(i)
        );

    }

}

//////////////////////////////////////////////////////
// PCM
//////////////////////////////////////////////////////

function floatTo16BitPCM(
output,
offset,
input
){

    for(
        let i=0;
        i<input.length;
        i++,
        offset += 2
    ){

        let s =
        Math.max(
            -1,
            Math.min(
                1,
                input[i]
            )
        );

        output.setInt16(
            offset,
            s < 0
            ? s * 0x8000
            : s * 0x7FFF,
            true
        );

    }

}

//////////////////////////////////////////////////////
// ADD TRACK
//////////////////////////////////////////////////////

addTrackBtn.onclick =
createTrack;

//////////////////////////////////////////////////////
// START
//////////////////////////////////////////////////////

createTrack();
