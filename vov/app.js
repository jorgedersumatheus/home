const tracksContainer = document.getElementById("tracks");
const mixer = document.getElementById("mixer");
const playhead = document.getElementById("playhead");
const timelineRuler = document.getElementById("timeline-ruler");
const addTrackBtn = document.getElementById("addTrackBtn");
const playBtn = document.getElementById("playBtn");
const stopBtn = document.getElementById("stopBtn");
const timeDisplay = document.getElementById("timeDisplay");

let tracks = [];
let playing = false;
let playheadX = 0;
let animation;

//////////////////////////////////////
// TIMELINE
//////////////////////////////////////

for(let i=1;i<=64;i++){

    const mark=document.createElement("div");
    mark.className="ruler-mark";
    mark.innerText=i;

    timelineRuler.appendChild(mark);
}

//////////////////////////////////////
// PLAYHEAD
//////////////////////////////////////

playBtn.onclick=()=>{

    if(playing) return;

    playing=true;

    tracks.forEach(t=>{
        if(t.audio.src){
            t.audio.play();
        }
    });

    animatePlayhead();
};

stopBtn.onclick=()=>{

    playing=false;

    cancelAnimationFrame(animation);

    playheadX=0;

    playhead.style.left="0px";

    timeDisplay.innerText="0.0";

    tracks.forEach(t=>{
        t.audio.pause();
        t.audio.currentTime=0;
    });
};

function animatePlayhead(){

    if(!playing) return;

    playheadX += 1;

    playhead.style.left = playheadX + "px";

    timeDisplay.innerText=(playheadX/100).toFixed(1);

    animation=requestAnimationFrame(animatePlayhead);
}

//////////////////////////////////////
// NOVA PISTA
//////////////////////////////////////

addTrackBtn.onclick=()=>{

    createTrack();
};

//////////////////////////////////////
// CREATE TRACK
//////////////////////////////////////

function createTrack(){

    const index = tracks.length + 1;

    //////////////////////////////////////
    // TRACK
    //////////////////////////////////////

    const track=document.createElement("div");
    track.className="track";

    //////////////////////////////////////
    // CLIP
    //////////////////////////////////////

    const clip=document.createElement("div");
    clip.className="clip";

    const title=document.createElement("div");
    title.className="clip-title";
    title.innerText="Track "+index;

    const waveform=document.createElement("div");
    waveform.className="waveform";

    clip.appendChild(title);
    clip.appendChild(waveform);

    track.appendChild(clip);

    tracksContainer.appendChild(track);

    //////////////////////////////////////
    // AUDIO
    //////////////////////////////////////

    const audio = new Audio();

    //////////////////////////////////////
    // MIXER
    //////////////////////////////////////

    const channel=document.createElement("div");
    channel.className="channel-strip";

    const recBtn=document.createElement("button");
    recBtn.innerText="REC";

    const playBtn=document.createElement("button");
    playBtn.innerText="▶";

    const stopBtn=document.createElement("button");
    stopBtn.innerText="■";

    const removeBtn=document.createElement("button");
    removeBtn.innerText="X";

    const volume=document.createElement("input");

    volume.type="range";
    volume.min=0;
    volume.max=1;
    volume.step=0.01;
    volume.value=0.8;

    audio.volume=0.8;

    volume.oninput=()=>{
        audio.volume=volume.value;
    };

    //////////////////////////////////////
    // REC
    //////////////////////////////////////

    let recorder;
    let chunks=[];
    let stream;

    recBtn.onclick=async()=>{

        try{

            stream = await navigator.mediaDevices.getUserMedia({
                audio:true
            });

            recorder = new MediaRecorder(stream);

            chunks=[];

            recorder.ondataavailable=e=>{
                chunks.push(e.data);
            };

            recorder.onstop=()=>{

                const blob = new Blob(chunks,{
                    type:"audio/webm"
                });

                const url = URL.createObjectURL(blob);

                audio.src = url;

                clip.style.width =
                    (200 + audio.duration * 20)+"px";

                stream.getTracks().forEach(t=>t.stop());

                waveform.style.background =
                "repeating-linear-gradient(to right,#00ff99,#00ff99 2px,transparent 2px,transparent 6px)";
            };

            recorder.start();

            recBtn.style.background="red";

        }catch(err){

            alert("Erro mic: "+err.message);
        }
    };

    //////////////////////////////////////
    // STOP REC
    //////////////////////////////////////

    stopBtn.onclick=()=>{

        if(recorder){

            recorder.stop();

            recBtn.style.background="";
        }

        audio.pause();
    };

    //////////////////////////////////////
    // PLAY INDIVIDUAL
    //////////////////////////////////////

    playBtn.onclick=()=>{

        if(audio.src){

            audio.currentTime=0;

            audio.play();
        }
    };

    //////////////////////////////////////
    // REMOVE
    //////////////////////////////////////

    removeBtn.onclick=()=>{

        audio.pause();

        track.remove();

        channel.remove();
    };

    //////////////////////////////////////
    // MIXER UI
    //////////////////////////////////////

    channel.appendChild(recBtn);
    channel.appendChild(playBtn);
    channel.appendChild(stopBtn);
    channel.appendChild(removeBtn);

    channel.innerHTML += "<br><br>Volume<br>";

    channel.appendChild(volume);

    mixer.appendChild(channel);

    //////////////////////////////////////
    // DRAG
    //////////////////////////////////////

    makeDraggable(clip);

    //////////////////////////////////////
    // SAVE
    //////////////////////////////////////

    tracks.push({
        audio,
        clip,
        track,
        channel
    });
}

//////////////////////////////////////
// DRAG CLIPS
//////////////////////////////////////

function makeDraggable(element){

    let dragging=false;
    let offsetX=0;

    element.addEventListener("mousedown",e=>{

        dragging=true;

        offsetX=e.clientX-element.offsetLeft;
    });

    document.addEventListener("mousemove",e=>{

        if(!dragging) return;

        let x=e.clientX-offsetX;

        if(x<0) x=0;

        element.style.left=x+"px";
    });

    document.addEventListener("mouseup",()=>{

        dragging=false;
    });

    //////////////////////////////////////
    // TOUCH MOBILE
    //////////////////////////////////////

    element.addEventListener("touchstart",e=>{

        dragging=true;

        offsetX=e.touches[0].clientX-element.offsetLeft;
    });

    document.addEventListener("touchmove",e=>{

        if(!dragging) return;

        let x=e.touches[0].clientX-offsetX;

        if(x<0) x=0;

        element.style.left=x+"px";
    });

    document.addEventListener("touchend",()=>{

        dragging=false;
    });
}
