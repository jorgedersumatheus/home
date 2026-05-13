/* =========================================
VERO ENGINE v3
APP.JS
TIMELINE REAL + ZOOM REAL + EXPORT
========================================= */

let audioContext = null;

let tracks = [];

let trackCount = 0;

let zoomLevel = 120;

let activeSources = [];

let playing = false;

let playheadFrame = null;

let playStartTime = 0;

let selectedTake = null;

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
GRID
===================================== */

function buildGrid(){

    document
        .querySelectorAll(
            ".gridLine,.gridText"
        )
        .forEach(
            e => e.remove()
        );

    for(let i=0;i<600;i++){

        const line =
            document.createElement(
                "div"
            );

        line.className =
            "gridLine";

        line.style.left =
            (
                180 +
                i * zoomLevel
            ) + "px";

        timeline.appendChild(
            line
        );

        const text =
            document.createElement(
                "div"
            );

        text.className =
            "gridText";

        text.style.left =
            (
                183 +
                i * zoomLevel
            ) + "px";

        text.innerText =
            i + "s";

        timeline.appendChild(
            text
        );
    }
}

buildGrid();

/* =====================================
TRACK
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

        gain:1
    };

    tracks.push(track);

    renderTrack(track);
}

document.getElementById(
    "addTrackBtn"
).onclick = createTrack;

/* =====================================
RENDER TRACK
===================================== */

function renderTrack(track){

    const div =
        document.createElement(
            "div"
        );

    div.className =
        "track";

    div.id =
        "track_" + track.id;

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

        <input
            type="range"
            min="0"
            max="2"
            step="0.01"
            value="1"
            id="gain_${track.id}"
        >

    </div>

    <div class="trackLane"
         id="lane_${track.id}">
    </div>

    `;

    timeline.insertBefore(
        div,
        timeline.firstChild
    );

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

    const delBtn =
        document.getElementById(
            "del_" + track.id
        );

    const gainSlider =
        document.getElementById(
            "gain_" + track.id
        );

    gainSlider.oninput = () => {

        track.gain =
            parseFloat(
                gainSlider.value
            );
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

    delBtn.onclick = () => {

        document
            .getElementById(
                "track_" + track.id
            )
            .remove();

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
                e => chunks.push(
                    e.data
                );

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

    block.takeData =
        take;

    lane.appendChild(
        block
    );

    /* MENU */

    const menu =
        document.createElement(
            "div"
        );

    menu.className =
        "editMenu";

    menu.innerHTML = `

    <button class="cutBtn">
        CUT
    </button>

    <button class="dupBtn">
        DUP
    </button>

    <button class="delBtn">
        DEL
    </button>

    `;

    block.appendChild(menu);

    /* CANVAS */

    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.className =
        "waveCanvas";

    block.appendChild(
        canvas
    );

    /* HANDLES */

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

    drawTake(
        block,
        take,
        canvas
    );

    /* SELECT */

    block.onclick = e => {

        e.stopPropagation();

        document
            .querySelectorAll(
                ".audioBlock"
            )
            .forEach(
                b => b.classList.remove(
                    "selected"
                )
            );

        block.classList.add(
            "selected"
        );

        selectedTake =
            take;
    };

    /* MOVE */

    let dragging = false;

    let dragStartX = 0;

    let dragStartPos = 0;

    block.onpointerdown = e => {

        if(
            e.target === leftHandle ||
            e.target === rightHandle
        ) return;

        dragging = true;

        dragStartX =
            e.clientX;

        dragStartPos =
            take.timelinePosition;
    };

    window.addEventListener(
        "pointermove",
        e => {

            if(!dragging)
                return;

            const delta =
                (
                    e.clientX -
                    dragStartX
                ) / zoomLevel;

            take.timelinePosition =
                Math.max(
                    0,
                    dragStartPos + delta
                );

            drawTake(
                block,
                take,
                canvas
            );
        }
    );

    window.addEventListener(
        "pointerup",
        () => {

            dragging = false;
        }
    );

    /* LEFT TRIM */

    let trimLeft = false;

    leftHandle.onpointerdown =
        () => {

        trimLeft = true;
    };

    /* RIGHT TRIM */

    let trimRight = false;

    rightHandle.onpointerdown =
        () => {

        trimRight = true;
    };

    window.addEventListener(
        "pointermove",
        e => {

            if(trimLeft){

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

                    take.startOffset = 0;
                }

                if(
                    take.startOffset >
                    take.endOffset - 0.05
                ){

                    take.startOffset =
                        take.endOffset - 0.05;
                }

                drawTake(
                    block,
                    take,
                    canvas
                );
            }

            if(trimRight){

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
                    take.startOffset + 0.05
                ){

                    take.endOffset =
                        take.startOffset + 0.05;
                }

                drawTake(
                    block,
                    take,
                    canvas
                );
            }
        }
    );

    window.addEventListener(
        "pointerup",
        () => {

            trimLeft = false;

            trimRight = false;
        }
    );

    /* CUT */

    menu.querySelector(
        ".cutBtn"
    ).onclick = () => {

        const middle =
            (
                take.startOffset +
                take.endOffset
            ) / 2;

        const second = {

            ...take,

            id:Date.now(),

            startOffset:middle,

            timelinePosition:
                take.timelinePosition +
                (
                    middle -
                    take.startOffset
                )
        };

        take.endOffset =
            middle;

        drawTake(
            block,
            take,
            canvas
        );

        track.takes.push(
            second
        );

        renderTake(
            track,
            second
        );
    };

    /* DUP */

    menu.querySelector(
        ".dupBtn"
    ).onclick = () => {

        const clone = {

            ...take,

            id:Date.now(),

            timelinePosition:
                take.timelinePosition + 1
        };

        track.takes.push(
            clone
        );

        renderTake(
            track,
            clone
        );
    };

    /* DELETE */

    menu.querySelector(
        ".delBtn"
    ).onclick = () => {

        block.remove();

        track.takes =
            track.takes.filter(
                t => t.id !== take.id
            );
    };
}

/* =====================================
DRAW TAKE
===================================== */

function drawTake(
    block,
    take,
    canvas
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

    renderWaveform(
        canvas,
        take
    );
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
            120,
            duration * zoomLevel
        );

    canvas.height = 80;

    const ctx =
        canvas.getContext("2d");

    ctx.fillStyle =
        "#111";

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
        take.buffer.getChannelData(
            0
        );

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
                    (i * step) + j
                ] || 0;

            if(datum < min)
                min = datum;

            if(datum > max)
                max = datum;
        }

        ctx.moveTo(
            i,
            (1 + min) * amp
        );

        ctx.lineTo(
            i,
            (1 + max) * amp
        );
    }

    ctx.stroke();
}

/* =====================================
PLAY
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

    const soloTracks =
        tracks.filter(
            t => t.solo
        );

    tracks.forEach(track => {

        if(track.muted)
            return;

        if(
            soloTracks.length &&
            !track.solo
        ) return;

        track.takes.forEach(take => {

            const source =
                audioContext
                .createBufferSource();

            const gainNode =
                audioContext
                .createGain();

            gainNode.gain.value =
                track.gain;

            source.buffer =
                take.buffer;

            source.connect(
                gainNode
            );

            gainNode.connect(
                audioContext.destination
            );

            source.start(
                now +
                take.timelinePosition,
                take.startOffset,
                take.endOffset -
                take.startOffset
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

    playing = false;

    cancelAnimationFrame(
        playheadFrame
    );

    activeSources.forEach(
        s => {

        try{
            s.stop();
        }catch(e){}
    );

    activeSources = [];
}

document.getElementById(
    "stopBtn"
).onclick = stopAll;

/* =====================================
PLAYHEAD
===================================== */

function animatePlayhead(){

    if(!playing)
        return;

    const elapsed =
        audioContext.currentTime -
        playStartTime;

    playhead.style.left =
        (
            180 +
            (
                elapsed *
                zoomLevel
            ) -
            timelineWrapper.scrollLeft
        ) + "px";

    playheadFrame =
        requestAnimationFrame(
            animatePlayhead
        );
}

/* =====================================
ZOOM
===================================== */

document.getElementById(
    "zoomInBtn"
).onclick = () => {

    zoomLevel += 20;

    refreshAllTakes();

    buildGrid();
};

document.getElementById(
    "zoomOutBtn"
).onclick = () => {

    zoomLevel -= 20;

    if(zoomLevel < 40)
        zoomLevel = 40;

    refreshAllTakes();

    buildGrid();
};

function refreshAllTakes(){

    document
        .querySelectorAll(
            ".audioBlock"
        )
        .forEach(block => {

            const take =
                block.takeData;

            const canvas =
                block.querySelector(
                    "canvas"
                );

            drawTake(
                block,
                take,
                canvas
            );
        });
}

/* =====================================
TRANSPORT
===================================== */

document.getElementById(
    "rewBtn"
).onclick = () => {

    timelineWrapper.scrollLeft -=
        500;
};

document.getElementById(
    "ffBtn"
).onclick = () => {

    timelineWrapper.scrollLeft +=
        500;
};

/* =====================================
EXPORT MASTER WAV
===================================== */

document.getElementById(
    "exportBtn"
).onclick = async () => {

    alert(
        "EXPORT MASTER em construção v3"
    );
};

/* =====================================
INIT
===================================== */

createTrack();
