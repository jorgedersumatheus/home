//////////////////////////////////////////////////////
// DAW VOV
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

            <button class="stop">
            STOP
            </button>

            <button class="play">
            PLAY
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

    `;

    tracksContainer
    .appendChild(track);

    //////////////////////////////////////////////////////
    // ELEMENTS
    //////////////////////////////////////////////////////

    const recBtn =
    track.querySelector(".rec");

    const stopBtn =
    track.querySelector(".stop");

    const playBtn =
    track.querySelector(".play");

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

    let processor;

    let input;

    let recording = false;

    let buffers = [];

    let wavBlob = null;

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
            // MIC
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
            // INPUT
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
                4096,
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
            // PROCESS AUDIO
            //////////////////////////////////////////////////////

            processor.onaudioprocess =
            e => {

                if(!recording) return;

                const data =
                e.inputBuffer
                .getChannelData(0);

                //////////////////////////////////////////////////////
                // COPY PCM
                //////////////////////////////////////////////////////

                buffers.push(
                    new Float32Array(data)
                );

                //////////////////////////////////////////////////////
                // METER
                //////////////////////////////////////////////////////

                let peak = 0;

                for(
                    let i=0;
                    i<data.length;
                    i++
                ){

                    const v =
                    Math.abs(data[i]);

                    if(v > peak){

                        peak = v;

                    }
                }

                fill.style.width =
                (peak * 100) + "%";

            };

            //////////////////////////////////////////////////////
            // CONNECT
            //////////////////////////////////////////////////////

            input.connect(processor);

            processor.connect(
                audioContext.destination
            );

            console.log(
            "PCM REC START"
            );

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

    stopBtn.onclick = () => {

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
    // EXPORT
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
    // TRACK SAVE
    //////////////////////////////////////////////////////

    tracks.push({

        audio,
        wavBlob

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
