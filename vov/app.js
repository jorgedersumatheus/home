/* =========================================
ARQUIVO 3 — app.js
VOV FLOW MEMORY v6
========================================= */

/* =====================================
AUDIO
===================================== */

let audioContext = null;

/* =====================================
CONFIG
===================================== */

const PIXELS_PER_SECOND = 120;

/* =====================================
DOM
===================================== */

const timeline =
    document.getElementById(
        "timeline"
    );

const timelineWrapper =
    document.getElementById(
        "timelineWrapper"
    );

const playhead =
    document.getElementById(
        "playhead"
    );

/* =====================================
STATE
===================================== */

let tracks = [];

let trackCount = 0;

let selectedTake = null;

let activeSources = [];

let timelineOffset = 0;

/* =====================================
GRID
===================================== */

for(let i=0;i<300;i++){

    const line =
        document.createElement("div");

    line.className =
        "gridLine";

    line.style.left =
        (
            180 +
            (
                i *
                PIXELS_PER_SECOND
            )
        ) + "px";

    timeline.appendChild(line);

    const text =
        document.createElement("div");

    text.className =
        "gridText";

    text.style.left =
        (
            183 +
            (
                i *
                PIXELS_PER_SECOND
            )
        ) + "px";

    text.innerText =
        i + "s";

    timeline.appendChild(text);
}

/* =====================================
ADD TRACK
===================================== */

document.getElementById(
    "addTrackBtn"
).onclick = () => {

    createTrack();
};

/* =====================================
CREATE TRACK
===================================== */

function createTrack(){

    trackCount++;

    const track = {

        id:trackCount,

        takes:[],

        recorder:null,

        stream:null,

        muted:false,

        solo:false,

        volume:1,

        pan:0
    };

    tracks.push(track);

    renderTrack(track);
}

/* =====================================
RENDER TRACK
===================================== */

function renderTrack(track){

    const div =
        document.createElement("div");

    div.className =
        "track";

    div.innerHTML = `

        <div class="trackHeader">

            <div class="trackTitle">
                TRACK ${track.id}
            </div>

            <div class="trackButtons">

                <button id="rec_${track.id}">
                    REC
                </button>

                <button id="mute_${track.id}">
                    M
                </button>

                <button id="solo_${track.id}">
                    S
                </button>

            </div>

            <div class="mixer">

                <label>
                    VOL
                </label>

                <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.01"
                    value="1"
                    id="vol_${track.id}"
                >

                <label>
                    PAN
                </label>

                <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.01"
                    value="0"
                    id="pan_${track.id}"
                >

            </div>

        </div>

        <div class="trackLane"
             id="lane_${track.id}">
        </div>

    `;

    timeline.appendChild(div);

    bindTrack(track);
}

/* =====================================
BIND TRACK
===================================== */

function bindTrack(track){

    const recBtn =
        document.getElementById(
            "rec_" + track.id
        );

    const muteBtn =
        document.getElementById(
            "mute_" + track.id
        );

    const soloBtn =
        document.getElementById(
            "solo_" + track.id
        );

    const volSlider =
        document.getElementById(
            "vol_" + track.id
        );

    const panSlider =
        document.getElementById(
            "pan_" + track.id
        );

    /* =====================================
    MIXER
    ===================================== */

    volSlider.oninput = () => {

        track.volume =
            parseFloat(
                volSlider.value
            );
    };

    panSlider.oninput = () => {

        track.pan =
            parseFloat(
                panSlider.value
            );
    };

    /* =====================================
    REC
    ===================================== */

    recBtn.onclick = async () => {

        try{

            if(!audioContext){

                audioContext =
                    new AudioContext();

                await audioContext.resume();
            }

            if(!track.recorder){

                const stream =
                    await navigator
                    .mediaDevices
                    .getUserMedia({
                        audio:true
                    });

                track.stream =
                    stream;

                const recorder =
                    new MediaRecorder(
                        stream
                    );

                const chunks = [];

                recorder.ondataavailable =
                    e => {

                        chunks.push(
                            e.data
                        );
                    };

                recorder.onstop =
                    async () => {

                    const blob =
                        new Blob(chunks);

                    const arrayBuffer =
                        await blob
                        .arrayBuffer();

                    const audioBuffer =
                        await audioContext
                        .decodeAudioData(
                            arrayBuffer
                        );

                    const take = {

                        id:Date.now(),

                        buffer:audioBuffer,

                        startOffset:0,

                        endOffset:
                            audioBuffer
                            .duration,

                        timelinePosition:0
                    };

                    track.takes.push(
                        take
                    );

                    renderTake(
                        track,
                        take
                    );
                };

                recorder.start();

                track.recorder =
                    recorder;

                recBtn.classList.add(
                    "recActive"
                );

            }else{

                track.recorder.stop();

                track.stream
                    .getTracks()
                    .forEach(
                        t => t.stop()
                    );

                track.recorder =
                    null;

                recBtn.classList.remove(
                    "recActive"
                );
            }

        }catch(error){

            console.error(error);

            alert(
                "Erro no REC"
            );
        }
    };

    /* =====================================
    MUTE
    ===================================== */

    muteBtn.onclick = () => {

        track.muted =
            !track.muted;

        muteBtn.classList.toggle(
            "muteActive"
        );
    };

    /* =====================================
    SOLO
    ===================================== */

    soloBtn.onclick = () => {

        track.solo =
            !track.solo;

        soloBtn.classList.toggle(
            "soloActive"
        );
    };
}

/* =====================================
RENDER TAKE
===================================== */

function renderTake(track,take){

    const lane =
        document.getElementById(
            "lane_" + track.id
        );

    const block =
        document.createElement("div");

    block.className =
        "audioBlock";

    updateTakeVisual(
        block,
        take
    );

    const leftHandle =
        document.createElement("div");

    leftHandle.className =
        "handle leftHandle";

    const rightHandle =
        document.createElement("div");

    rightHandle.className =
        "handle rightHandle";

    block.appendChild(
        leftHandle
    );

    block.appendChild(
        rightHandle
    );

    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.className =
        "waveCanvas";

    block.appendChild(
        canvas
    );

    renderWaveform(
        canvas,
        take
    );

    lane.appendChild(
        block
    );

    block.onclick = () => {

        document
            .querySelectorAll(
                ".audioBlock"
            )
            .forEach(
                b => b.classList
                .remove(
                    "selected"
                )
            );

        block.classList.add(
            "selected"
        );

        selectedTake = take;
    };

    /* MOVE */

    let dragging = false;

    let startPointerX = 0;

    let startTimelinePosition = 0;

    block.addEventListener(
        "pointerdown",
        e => {

            if(
                e.target === leftHandle ||
                e.target === rightHandle
            ) return;

            dragging = true;

            startPointerX =
                e.clientX;

            startTimelinePosition =
                take.timelinePosition;

            block.setPointerCapture(
                e.pointerId
            );
        }
    );

    block.addEventListener(
        "pointermove",
        e => {

            if(!dragging)
                return;

            const deltaX =
                e.clientX -
                startPointerX;

            let newPosition =
                startTimelinePosition +
                (
                    deltaX /
                    PIXELS_PER_SECOND
                );

            if(newPosition < 0)
                newPosition = 0;

            take.timelinePosition =
                newPosition;

            updateTakeVisual(
                block,
                take
            );
        }
    );

    block.addEventListener(
        "pointerup",
        () => {

            dragging = false;
        }
    );

    /* LEFT TRIM */

    let trimLeft = false;

    leftHandle.addEventListener(
        "pointerdown",
        e => {

            e.stopPropagation();

            trimLeft = true;

            leftHandle.setPointerCapture(
                e.pointerId
            );
        }
    );

    leftHandle.addEventListener(
        "pointermove",
        e => {

            if(!trimLeft)
                return;

            const delta =
                e.movementX /
                PIXELS_PER_SECOND;

            take.startOffset +=
                delta;

            if(
                take.startOffset < 0
            ){
                take.startOffset = 0;
            }

            if(
                take.startOffset >
                take.endOffset - 0.2
            ){
                take.startOffset =
                    take.endOffset - 0.2;
            }

            updateTakeVisual(
                block,
                take
            );

            renderWaveform(
                canvas,
                take
            );
        }
    );

    leftHandle.addEventListener(
        "pointerup",
        () => {

            trimLeft = false;
        }
    );

    /* RIGHT TRIM */

    let trimRight = false;

    rightHandle.addEventListener(
        "pointerdown",
        e => {

            e.stopPropagation();

            trimRight = true;

            rightHandle.setPointerCapture(
                e.pointerId
            );
        }
    );

    rightHandle.addEventListener(
        "pointermove",
        e => {

            if(!trimRight)
                return;

            const delta =
                e.movementX /
                PIXELS_PER_SECOND;

            take.endOffset +=
                delta;

            if(
                take.endOffset >
                take.buffer.duration
            ){
                take.endOffset =
                    take.buffer.duration;
            }

            if(
                take.endOffset <
                take.startOffset + 0.2
            ){
                take.endOffset =
                    take.startOffset + 0.2;
            }

            updateTakeVisual(
                block,
                take
            );

            renderWaveform(
                canvas,
                take
            );
        }
    );

    rightHandle.addEventListener(
        "pointerup",
        () => {

            trimRight = false;
        }
    );
}

/* =====================================
VISUAL
===================================== */

function updateTakeVisual(
    block,
    take
){

    const duration =
        take.endOffset -
        take.startOffset;

    block.style.left =
        (
            take.timelinePosition *
            PIXELS_PER_SECOND
        ) + "px";

    block.style.width =
        (
            duration *
            PIXELS_PER_SECOND
        ) + "px";
}

/* =====================================
WAVEFORM
===================================== */

function renderWaveform(
    canvas,
    take
){

    const duration =
        take.endOffset -
        take.startOffset;

    canvas.width =
        duration *
        PIXELS_PER_SECOND;

    canvas.height = 80;

    const ctx =
        canvas.getContext("2d");

    ctx.fillStyle =
        "#181818";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.strokeStyle =
        "#00ff99";

    ctx.beginPath();

    const data =
        take.buffer.getChannelData(0);

    const step =
        Math.ceil(
            data.length /
            canvas.width
        );

    const amp =
        canvas.height / 2;

    for(let i=0;i<canvas.width;i++){

        let min = 1;
        let max = -1;

        for(let j=0;j<step;j++){

            const datum =
                data[
                    (
                        i *
                        step
                    ) + j
                ] || 0;

            if(datum < min)
                min = datum;

            if(datum > max)
                max = datum;
        }

        ctx.moveTo(
            i,
            (
                1 + min
            ) * amp
        );

        ctx.lineTo(
            i,
            (
                1 + max
            ) * amp
        );
    }

    ctx.stroke();
}

/* =====================================
PLAYBACK
===================================== */

document.getElementById(
    "playBtn"
).onclick = () => {

    if(!audioContext)
        return;

    stopAll();

    const now =
        audioContext.currentTime;

    tracks.forEach(track => {

        if(track.muted)
            return;

        track.takes.forEach(take => {

            const source =
                audioContext
                .createBufferSource();

            source.buffer =
                take.buffer;

            const gainNode =
                audioContext
                .createGain();

            gainNode.gain.value =
                track.volume;

            const panNode =
                audioContext
                .createStereoPanner();

            panNode.pan.value =
                track.pan;

            source.connect(
                gainNode
            );

            gainNode.connect(
                panNode
            );

            panNode.connect(
                audioContext.destination
            );

            const duration =
                take.endOffset -
                take.startOffset;

            source.start(
                now +
                take.timelinePosition,
                take.startOffset,
                duration
            );

            activeSources.push(
                source
            );
        });
    });
};

/* =====================================
STOP
===================================== */

function stopAll(){

    activeSources.forEach(
        s => {

        try{
            s.stop();
        }catch(e){}
    });

    activeSources = [];
}

document.getElementById(
    "stopBtn"
).onclick = stopAll;

/* =====================================
TRANSPORT
===================================== */

document.getElementById(
    "rewBtn"
).onclick = () => {

    timelineOffset -= 5;

    if(timelineOffset < 0)
        timelineOffset = 0;

    updateTransport();
};

document.getElementById(
    "ffBtn"
).onclick = () => {

    timelineOffset += 5;

    updateTransport();
};

function updateTransport(){

    const px =
        timelineOffset *
        PIXELS_PER_SECOND;

    timelineWrapper.scrollLeft =
        px;

    playhead.style.left =
        (
            180 + px
        ) + "px";
}

/* =====================================
EXPORT TRACK
===================================== */

document.getElementById(
    "exportTrackBtn"
).onclick = async () => {

    if(!selectedTake){

        alert(
            "Selecione uma faixa"
        );

        return;
    }

    exportTake(
        selectedTake
    );
};

async function exportTake(take){

    const wav =
        audioBufferToWav(
            take.buffer
        );

    downloadBlob(
        wav,
        "track.wav"
    );
}

/* =====================================
EXPORT MIX
===================================== */

document.getElementById(
    "exportMixBtn"
).onclick = async () => {

    if(!audioContext)
        return;

    const maxDuration =
        getMaxDuration();

    const offline =
        new OfflineAudioContext(
            2,
            44100 * maxDuration,
            44100
        );

    tracks.forEach(track => {

        if(track.muted)
            return;

        track.takes.forEach(take => {

            const source =
                offline
                .createBufferSource();

            source.buffer =
                take.buffer;

            const gainNode =
                offline
                .createGain();

            gainNode.gain.value =
                track.volume;

            const panNode =
                offline
                .createStereoPanner();

            panNode.pan.value =
                track.pan;

            source.connect(
                gainNode
            );

            gainNode.connect(
                panNode
            );

            panNode.connect(
                offline.destination
            );

            const duration =
                take.endOffset -
                take.startOffset;

            source.start(
                take.timelinePosition,
                take.startOffset,
                duration
            );
        });
    });

    const rendered =
        await offline
        .startRendering();

    const wav =
        audioBufferToWav(
            rendered
        );

    downloadBlob(
        wav,
        "mix.wav"
    );
};

function getMaxDuration(){

    let max = 0;

    tracks.forEach(track => {

        track.takes.forEach(take => {

            const end =
                take.timelinePosition +
                (
                    take.endOffset -
                    take.startOffset
                );

            if(end > max)
                max = end;
        });
    });

    return max + 1;
}

/* =====================================
DOWNLOAD
===================================== */

function downloadBlob(
    blob,
    filename
){

    const url =
        URL.createObjectURL(
            blob
        );

    const a =
        document.createElement("a");

    a.href = url;

    a.download =
        filename;

    a.click();

    URL.revokeObjectURL(
        url
    );
}

/* =====================================
WAV ENCODER
===================================== */

function audioBufferToWav(buffer){

    const numChannels =
        buffer.numberOfChannels;

    const sampleRate =
        buffer.sampleRate;

    let result;

    if(numChannels === 2){

        result = interleave(
            buffer.getChannelData(0),
            buffer.getChannelData(1)
        );

    }else{

        result =
            buffer.getChannelData(0);
    }

    const bufferLength =
        result.length * 2;

    const arrayBuffer =
        new ArrayBuffer(
            44 + bufferLength
        );

    const view =
        new DataView(
            arrayBuffer
        );

    writeString(view,0,'RIFF');

    view.setUint32(
        4,
        36 + bufferLength,
        true
    );

    writeString(view,8,'WAVE');

    writeString(view,12,'fmt ');

    view.setUint32(
        16,
        16,
        true
    );

    view.setUint16(
        20,
        1,
        true
    );

    view.setUint16(
        22,
        numChannels,
        true
    );

    view.setUint32(
        24,
        sampleRate,
        true
    );

    view.setUint32(
        28,
        sampleRate *
        numChannels *
        2,
        true
    );

    view.setUint16(
        32,
        numChannels * 2,
        true
    );

    view.setUint16(
        34,
        16,
        true
    );

    writeString(view,36,'data');

    view.setUint32(
        40,
        bufferLength,
        true
    );

    floatTo16BitPCM(
        view,
        44,
        result
    );

    return new Blob(
        [view],
        {type:'audio/wav'}
    );
}

function interleave(left,right){

    const length =
        left.length +
        right.length;

    const result =
        new Float32Array(length);

    let inputIndex = 0;

    for(let i=0;i<length;){

        result[i++] =
            left[inputIndex];

        result[i++] =
            right[inputIndex];

        inputIndex++;
    }

    return result;
}

function floatTo16BitPCM(
    output,
    offset,
    input
){

    for(let i=0;i<input.length;i++,offset+=2){

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

function writeString(
    view,
    offset,
    string
){

    for(let i=0;i<string.length;i++){

        view.setUint8(
            offset + i,
            string.charCodeAt(i)
        );
    }
}

/* =====================================
INIT
===================================== */

window.onload = () => {

    createTrack();

    console.log(
        "VOV FLOW MEMORY v6 READY"
    );
};
