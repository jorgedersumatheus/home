/* =========================================
ARQUIVO 3 — app.js
VOV VERO EDIT ENGINE v1
========================================= */

let audioContext = null;

let tracks = [];

let trackCount = 0;

let selectedTake = null;

let activeSources = [];

let playing = false;

let playheadAnimation = null;

let playStartTime = 0;

let zoomLevel = 120;

const timeline =
    document.getElementById(
        "timeline"
    );

const timelineWrapper =
    document.getElementById(
        "timelineWrapper"
    );

const veroCanvas =
    document.getElementById(
        "veroCanvas"
    );

const veroCtx =
    veroCanvas.getContext("2d");

/* =====================================
VERO
===================================== */

function resizeVeroCanvas(){

    veroCanvas.width =
        timeline.scrollWidth;

    veroCanvas.height =
        timeline.scrollHeight;
}

resizeVeroCanvas();

window.addEventListener(
    "resize",
    resizeVeroCanvas
);

/* =====================================
GRID
===================================== */

for(let i=0;i<300;i++){

    const line =
        document.createElement(
            "div"
        );

    line.className =
        "gridLine";

    line.style.left =
        (
            180 +
            (
                i * zoomLevel
            )
        ) + "px";

    timeline.appendChild(line);

    const text =
        document.createElement(
            "div"
        );

    text.className =
        "gridText";

    text.style.left =
        (
            183 +
            (
                i * zoomLevel
            )
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
        document.createElement(
            "div"
        );

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

            <button id="del_${track.id}">
                X
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

    bindTrack(track,div);
}

/* =====================================
BIND
===================================== */

function bindTrack(track,div){

    const recBtn =
        document.getElementById(
            "rec_" + track.id
        );

    const delBtn =
        document.getElementById(
            "del_" + track.id
        );

    delBtn.onclick = () => {

        div.remove();

        tracks =
            tracks.filter(
                t => t.id !== track.id
            );
    };

    recBtn.onclick = async () => {

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
                            audioBuffer.duration,

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

            track.recorder = null;

            recBtn.classList.remove(
                "recActive"
            );
        }
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
        document.createElement(
            "div"
        );

    block.className =
        "audioBlock";

    updateTakeVisual(
        block,
        take
    );

    /* =====================================
    MENU
    ===================================== */

    const menu =
        document.createElement(
            "div"
        );

    menu.className =
        "editMenu";

    menu.style.display =
        "none";

    menu.innerHTML = `

    <button class="delTake">
        DEL
    </button>

    `;

    block.appendChild(menu);

    /* =====================================
    HANDLES
    ===================================== */

    const leftHandle =
        document.createElement(
            "div"
        );

    leftHandle.className =
        "handle leftHandle";

    const rightHandle =
        document.createElement(
            "div"
        );

    rightHandle.className =
        "handle rightHandle";

    block.appendChild(
        leftHandle
    );

    block.appendChild(
        rightHandle
    );

    /* =====================================
    CANVAS
    ===================================== */

    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.className =
        "waveCanvas";

    block.appendChild(
        canvas
    );

    lane.appendChild(
        block
    );

    requestAnimationFrame(
        () => {

        renderWaveform(
            canvas,
            take
        );
    });

    /* =====================================
    SELECT
    ===================================== */

    block.onclick = e => {

        e.stopPropagation();

        document
            .querySelectorAll(
                ".audioBlock"
            )
            .forEach(
                b => {

                b.classList.remove(
                    "selected"
                );

                const m =
                    b.querySelector(
                        ".editMenu"
                    );

                if(m)
                    m.style.display =
                        "none";
            });

        block.classList.add(
            "selected"
        );

        menu.style.display =
            "flex";

        selectedTake = take;
    };

    /* =====================================
    DELETE TAKE
    ===================================== */

    menu.querySelector(
        ".delTake"
    ).onclick = e => {

        e.stopPropagation();

        block.remove();

        track.takes =
            track.takes.filter(
                t => t.id !== take.id
            );
    };

    /* =====================================
    MOVE
    ===================================== */

    let dragging = false;

    let startX = 0;

    let startPos = 0;

    block.addEventListener(
        "pointerdown",
        e => {

            if(
                e.target === leftHandle ||
                e.target === rightHandle
            ) return;

            dragging = true;

            startX =
                e.clientX;

            startPos =
                take.timelinePosition;
        }
    );

    window.addEventListener(
        "pointermove",
        e => {

            if(!dragging)
                return;

            const delta =
                (
                    e.clientX -
                    startX
                ) / zoomLevel;

            take.timelinePosition =
                Math.max(
                    0,
                    startPos + delta
                );

            updateTakeVisual(
                block,
                take
            );
        }
    );

    window.addEventListener(
        "pointerup",
        () => {

            dragging = false;
        }
    );

    /* =====================================
    TRIM LEFT
    ===================================== */

    let trimmingLeft = false;

    leftHandle.addEventListener(
        "pointerdown",
        e => {

            e.stopPropagation();

            trimmingLeft = true;
        }
    );

    /* =====================================
    TRIM RIGHT
    ===================================== */

    let trimmingRight = false;

    rightHandle.addEventListener(
        "pointerdown",
        e => {

            e.stopPropagation();

            trimmingRight = true;
        }
    );

    window.addEventListener(
        "pointermove",
        e => {

            /* LEFT */

            if(trimmingLeft){

                const delta =
                    e.movementX /
                    zoomLevel;

                take.startOffset +=
                    delta;

                take.timelinePosition +=
                    delta;

                if(
                    take.startOffset < 0
                ){

                    take.timelinePosition -=
                        take.startOffset;

                    take.startOffset = 0;
                }

                if(
                    take.startOffset >
                    take.endOffset - 0.1
                ){

                    take.startOffset =
                        take.endOffset - 0.1;
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

            /* RIGHT */

            if(trimmingRight){

                const delta =
                    e.movementX /
                    zoomLevel;

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
                    take.startOffset + 0.1
                ){

                    take.endOffset =
                        take.startOffset + 0.1;
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
        }
    );

    window.addEventListener(
        "pointerup",
        () => {

            trimmingLeft = false;

            trimmingRight = false;
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
            zoomLevel
        ) + "px";

    block.style.width =
        (
            duration *
            zoomLevel
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
        Math.max(
            100,
            duration *
            zoomLevel
        );

    canvas.height = 80;

    const ctx =
        canvas.getContext("2d");

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

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
                        i * step
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

    playing = true;

    playStartTime =
        audioContext.currentTime;

    animatePlayhead();

    const now =
        audioContext.currentTime;

    tracks.forEach(track => {

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
                now,
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
PLAYHEAD
===================================== */

function animatePlayhead(){

    if(!playing)
        return;

    const elapsed =
        audioContext.currentTime -
        playStartTime;

    const scrollX =
        elapsed *
        zoomLevel;

    timelineWrapper.scrollLeft =
        scrollX;

    playheadAnimation =
        requestAnimationFrame(
            animatePlayhead
        );
}

/* =====================================
STOP
===================================== */

function stopAll(){

    playing = false;

    cancelAnimationFrame(
        playheadAnimation
    );

    timelineWrapper.scrollLeft = 0;

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
ZOOM
===================================== */

document.getElementById(
    "zoomInBtn"
).onclick = () => {

    zoomLevel += 20;
};

document.getElementById(
    "zoomOutBtn"
).onclick = () => {

    zoomLevel -= 20;

    if(zoomLevel < 40)
        zoomLevel = 40;
};

/* =====================================
INIT
===================================== */

createTrack();
