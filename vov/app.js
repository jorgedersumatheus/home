/* =========================================
ARQUIVO 3 — app.js
VOV FLOW MEMORY v7
INPUT ENGINE
========================================= */

let audioContext = null;

const PIXELS_PER_SECOND = 120;

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

const inputMeter =
    document.getElementById(
        "inputMeter"
    );

let tracks = [];

let trackCount = 0;

let selectedTake = null;

let activeSources = [];

let timelineOffset = 0;

let monitorEnabled = false;

/* =====================================
INPUT ENGINE
===================================== */

let inputGainValue = 1;

let compressorAmount = 0.4;

document.getElementById(
    "inputGain"
).oninput = e => {

    inputGainValue =
        parseFloat(
            e.target.value
        );
};

document.getElementById(
    "compressAmount"
).oninput = e => {

    compressorAmount =
        parseFloat(
            e.target.value
        );
};

document.getElementById(
    "monitorBtn"
).onclick = function(){

    monitorEnabled =
        !monitorEnabled;

    this.innerText =
        monitorEnabled
        ? "ON"
        : "OFF";
};

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
            i *
            PIXELS_PER_SECOND
        ) + "px";

    timeline.appendChild(line);

    const text =
        document.createElement("div");

    text.className =
        "gridText";

    text.style.left =
        (
            183 +
            i *
            PIXELS_PER_SECOND
        ) + "px";

    text.innerText =
        i + "s";

    timeline.appendChild(text);
}

/* =====================================
TRACK
===================================== */

document.getElementById(
    "addTrackBtn"
).onclick = () => {

    createTrack();
};

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

function renderTrack(track){

    const div =
        document.createElement("div");

    div.className =
        "track";

    div.innerHTML = `

        <div class="trackHeader">

            <div>
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
BIND
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
                        audio:{
                            echoCancellation:true,
                            noiseSuppression:true,
                            autoGainControl:true
                        }
                    });

                track.stream =
                    stream;

                const source =
                    audioContext
                    .createMediaStreamSource(
                        stream
                    );

                const gainNode =
                    audioContext
                    .createGain();

                gainNode.gain.value =
                    inputGainValue;

                const compressor =
                    audioContext
                    .createDynamicsCompressor();

                compressor.threshold.value =
                    -24;

                compressor.knee.value =
                    30;

                compressor.ratio.value =
                    12 *
                    compressorAmount;

                compressor.attack.value =
                    0.003;

                compressor.release.value =
                    0.25;

                const analyser =
                    audioContext
                    .createAnalyser();

                analyser.fftSize = 256;

                source.connect(gainNode);

                gainNode.connect(
                    compressor
                );

                compressor.connect(
                    analyser
                );

                if(monitorEnabled){

                    analyser.connect(
                        audioContext.destination
                    );
                }

                meterLoop(analyser);

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

                    inputMeter.style.width =
                        "0%";

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
                            audioBuffer.duration,

                        timelinePosition:0
                    };

                    track.takes.push(take);

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

                track.recorder = null;

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

    muteBtn.onclick = () => {

        track.muted =
            !track.muted;

        muteBtn.classList.toggle(
            "muteActive"
        );
    };

    soloBtn.onclick = () => {

        track.solo =
            !track.solo;

        soloBtn.classList.toggle(
            "soloActive"
        );
    };
}

/* =====================================
INPUT METER
===================================== */

function meterLoop(analyser){

    const data =
        new Uint8Array(
            analyser.frequencyBinCount
        );

    function update(){

        analyser.getByteFrequencyData(
            data
        );

        let sum = 0;

        for(let i=0;i<data.length;i++){

            sum += data[i];
        }

        let average =
            sum / data.length;

        let percent =
            (
                average / 255
            ) * 100;

        inputMeter.style.width =
            percent + "%";

        if(percent < 60){

            inputMeter.style.background =
                "lime";

        }else if(percent < 85){

            inputMeter.style.background =
                "yellow";

        }else{

            inputMeter.style.background =
                "red";
        }

        requestAnimationFrame(
            update
        );
    }

    update();
}

/* =====================================
TAKES
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

    block.appendChild(leftHandle);

    block.appendChild(rightHandle);

    const canvas =
        document.createElement("canvas");

    canvas.className =
        "waveCanvas";

    block.appendChild(canvas);

    renderWaveform(
        canvas,
        take
    );

    lane.appendChild(block);

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
                data[(i*step)+j] || 0;

            if(datum < min)
                min = datum;

            if(datum > max)
                max = datum;
        }

        ctx.moveTo(
            i,
            (1+min)*amp
        );

        ctx.lineTo(
            i,
            (1+max)*amp
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

            source.connect(gainNode);

            gainNode.connect(panNode);

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

            activeSources.push(source);
        });
    });
};

function stopAll(){

    activeSources.forEach(s => {

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
INIT
===================================== */

window.onload = () => {

    createTrack();

    console.log(
        "VOV INPUT ENGINE READY"
    );
};
