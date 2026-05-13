/* =========================================
VERO DAW — app.js
FIX DELETE + REAL CUT
========================================= */

let audioContext = null;

let tracks = [];

let trackCount = 0;

let zoomLevel = 120;

let activeSources = [];

const timeline =
document.getElementById(
"timeline"
);

const playhead =
document.getElementById(
"playhead"
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

/* DELETE TRACK */

delBtn.onclick = e => {

e.stopPropagation();

const el =
document.getElementById(
"track_"+track.id
);

if(el)
el.remove();

tracks =
tracks.filter(
t=>t.id!==track.id
);
};

/* REC */

recBtn.onclick = async()=>{

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
new MediaRecorder(stream);

const chunks=[];

recorder.ondataavailable =
e=>chunks.push(e.data);

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

menu.style.display =
"none";

const cutBtn =
document.createElement("button");

cutBtn.innerText =
"CUT";

const delBtn =
document.createElement("button");

delBtn.innerText =
"DEL";

menu.appendChild(cutBtn);

menu.appendChild(delBtn);

block.appendChild(menu);

/* CANVAS */

const canvas =
document.createElement("canvas");

canvas.className =
"waveCanvas";

block.appendChild(canvas);

drawTake(
block,
take,
canvas
);

/* SHOW MENU */

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

/* DELETE TAKE */

delBtn.onclick = e => {

e.stopPropagation();

block.remove();

track.takes =
track.takes.filter(
t=>t.id!==take.id
);
};

/* REAL CUT */

cutBtn.onclick = e => {

e.stopPropagation();

const currentDuration =
take.endOffset -
take.startOffset;

if(currentDuration < 0.4)
return;

take.endOffset =
take.startOffset +
(currentDuration/2);

drawTake(
block,
take,
canvas
);
};

/* DRAG */

let dragging=false;

let startX=0;

let startPos=0;

block.onpointerdown =
e=>{

if(
e.target.tagName==="BUTTON"
)
return;

dragging=true;

startX=
e.clientX;

startPos=
take.timelinePosition;
};

window.addEventListener(
"pointermove",
e=>{

if(!dragging)
return;

const delta =
(
e.clientX-startX
)/zoomLevel;

take.timelinePosition =
Math.max(
0,
startPos+delta
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
duration*zoomLevel;

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
"EXPORT EM DESENVOLVIMENTO"
);
};

/* =====================================
INIT
===================================== */

createTrack();
