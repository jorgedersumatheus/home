let audioContext = null;

let tracks = [];

let trackCount = 0;

let zoomLevel = 120;

let activeSources = [];

const timeline =
document.getElementById(
"timeline"
);

const timelineWrapper =
document.getElementById(
"timelineWrapper"
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
e=>e.remove()
);

for(let i=0;i<600;i++){

const line =
document.createElement("div");

line.className =
"gridLine";

line.style.left =
(i*zoomLevel)+"px";

timeline.appendChild(line);

const text =
document.createElement("div");

text.className =
"gridText";

text.style.left =
(i*zoomLevel+5)+"px";

text.innerText =
i+"s";

timeline.appendChild(text);
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

stream:null
};

tracks.push(track);

renderTrack(track);
}

document
.getElementById(
"addTrackBtn"
)
.onclick =
createTrack;

/* =====================================
RENDER TRACK
===================================== */

function renderTrack(track){

const div =
document.createElement("div");

div.className =
"track";

div.id =
"track_"+track.id;

div.innerHTML = `

<div class="trackHeader">

<div>
TRACK ${track.id}
</div>

<div class="trackButtons">

<button id="rec_${track.id}">
REC
</button>

<button id="del_${track.id}">
X
</button>

</div>

</div>

<div
class="trackLane"
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
"rec_"+track.id
);

const delBtn =
document.getElementById(
"del_"+track.id
);

delBtn.onclick = ()=>{

document
.getElementById(
"track_"+track.id
)
.remove();

tracks =
tracks.filter(
t=>t.id!==track.id
);
};

recBtn.onclick =
async()=>{

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

const chunks=[];

recorder.ondataavailable =
e=>chunks.push(
e.data
);

recorder.onstop =
async()=>{

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
t=>t.stop()
);

track.recorder =
null;

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
"lane_"+track.id
);

const block =
document.createElement("div");

block.className =
"audioBlock";

lane.appendChild(block);

/* MENU */

const menu =
document.createElement("div");

menu.className =
"editMenu";

menu.innerHTML = `

<button class="cutBtn">
CUT
</button>

<button class="delBtn">
DEL
</button>

`;

menu.style.display =
"none";

block.appendChild(menu);

/* WAVE */

const canvas =
document.createElement("canvas");

canvas.className =
"waveCanvas";

block.appendChild(canvas);

/* HANDLES */

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
".editMenu"
)
.forEach(
m=>m.style.display=
"none"
);

menu.style.display =
"flex";
};

/* DELETE */

menu
.querySelector(".delBtn")
.onclick = ()=>{

block.remove();

track.takes =
track.takes.filter(
t=>t.id!==take.id
);
};

/* CUT */

menu
.querySelector(".cutBtn")
.onclick = ()=>{

const duration =
take.endOffset -
take.startOffset;

if(duration<0.5)
return;

take.endOffset =
take.startOffset +
(duration/2);

drawTake(
block,
take,
canvas
);
};

/* =====================================
MOVE
===================================== */

let dragging=false;

let dragStartX=0;

let dragStartPos=0;

block.addEventListener(
"pointerdown",
e=>{

if(
e.target.classList.contains(
"handle"
)
) return;

dragging=true;

dragStartX =
e.clientX;

dragStartPos =
take.timelinePosition;
}
);

window.addEventListener(
"pointermove",
e=>{

if(!dragging)
return;

const delta =
(
e.clientX -
dragStartX
)/zoomLevel;

take.timelinePosition =
Math.max(
0,
dragStartPos +
delta
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
()=>{
dragging=false;
});

/* =====================================
LEFT TRIM
===================================== */

let trimmingLeft=false;

leftHandle.addEventListener(
"pointerdown",
e=>{

e.stopPropagation();

trimmingLeft=true;
}
);

window.addEventListener(
"pointermove",
e=>{

if(!trimmingLeft)
return;

const delta =
e.movementX /
zoomLevel;

take.startOffset +=
delta;

take.timelinePosition +=
delta;

if(take.startOffset<0){

take.startOffset=0;
}

if(
take.startOffset >
take.endOffset - 0.1
){

take.startOffset =
take.endOffset - 0.1;
}

drawTake(
block,
take,
canvas
);
}
);

window.addEventListener(
"pointerup",
()=>{
trimmingLeft=false;
});

/* =====================================
RIGHT TRIM
===================================== */

let trimmingRight=false;

rightHandle.addEventListener(
"pointerdown",
e=>{

e.stopPropagation();

trimmingRight=true;
}
);

window.addEventListener(
"pointermove",
e=>{

if(!trimmingRight)
return;

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
take.startOffset+0.1
){

take.endOffset =
take.startOffset+0.1;
}

drawTake(
block,
take,
canvas
);
}
);

window.addEventListener(
"pointerup",
()=>{
trimmingRight=false;
});
}

/* =====================================
DRAW
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
)+"px";

block.style.width =
(
duration *
zoomLevel
)+"px";

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
duration *
zoomLevel
);

canvas.height=80;

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
take.buffer.getChannelData(0);

const step =
Math.ceil(
data.length/
canvas.width
);

const amp =
canvas.height/2;

for(let i=0;i<canvas.width;i++){

let min=1;
let max=-1;

for(let j=0;j<step;j++){

const datum =
data[
(i*step)+j
]||0;

if(datum<min)
min=datum;

if(datum>max)
max=datum;
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
PLAY
===================================== */

document
.getElementById(
"playBtn"
)
.onclick = ()=>{

if(!audioContext)
return;

stopAll();

const now =
audioContext.currentTime;

tracks.forEach(track=>{

track.takes.forEach(take=>{

const source =
audioContext
.createBufferSource();

source.buffer =
take.buffer;

source.connect(
audioContext.destination
);

source.start(
now+
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

activeSources.forEach(s=>{

try{
s.stop();
}catch(e){}
});

activeSources=[];
}

document
.getElementById(
"stopBtn"
)
.onclick =
stopAll;

/* =====================================
TRANSPORT
===================================== */

document
.getElementById(
"rewBtn"
)
.onclick = ()=>{

timelineWrapper.scrollLeft -=
400;
};

document
.getElementById(
"ffBtn"
)
.onclick = ()=>{

timelineWrapper.scrollLeft +=
400;
};

/* =====================================
ZOOM
===================================== */

document
.getElementById(
"zoomInBtn"
)
.onclick = ()=>{

zoomLevel += 20;

buildGrid();
};

document
.getElementById(
"zoomOutBtn"
)
.onclick = ()=>{

zoomLevel -= 20;

if(zoomLevel<40)
zoomLevel=40;

buildGrid();
};

/* =====================================
EXPORT
===================================== */

document
.getElementById(
"exportBtn"
)
.onclick = ()=>{

alert(
"EXPORT STEM/MIX EM BREVE"
);
};

/* =====================================
INIT
===================================== */

createTrack();
