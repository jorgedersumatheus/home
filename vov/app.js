/* =========================================
ARQUIVO 3 — app.js
========================================= */

const audioContext =
    new AudioContext();

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

const menu =
    document.getElementById(
        "menu"
    );

let tracks = [];

let trackCount = 0;

let selectedTake = null;

let playing = false;

let playStart = 0;

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

        solo:false
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

    recBtn.onclick = async () => {

        if(!track.recorder){

            const stream =
                await navigator
                .mediaDevices
                .getUserMedia({
                    audio:true
                });

            track.stream = stream;

            const recorder =
                new MediaRecorder(stream);

            const chunks = [];

            recorder.ondataavailable =
                e => chunks.push(e.data);

            recorder.onstop = async () => {

                const blob =
                    new Blob(chunks);

                const arrayBuffer =
                    await blob.arrayBuffer();

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

                    timelinePosition:0,

                    source:null,

                    cursor:null,

                    playing:false
                };

                track.takes.push(take);

                renderTake(track,take);
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
                .forEach(t => t.stop());

            track.recorder = null;

            recBtn.classList.remove(
                "recActive"
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
TAKE
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

            selectedTake = take;

            block.setPointerCapture(
                e.pointerId
            );

            startPointerX =
                e.clientX;

            startTimelinePosition =
                take.timelinePosition;
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

            take.startOffset += delta;

            if(take.startOffset < 0)
                take.startOffset = 0;

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

            take.endOffset += delta;

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
                data[(i*step)+j];

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

            source.connect(
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

createTrack();
