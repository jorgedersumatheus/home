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

// TIMELINE
for(let i=1;i<=32;i++){

    const mark = document.createElement("div");
    mark.className = "ruler-mark";
    mark.innerText = i;

    timelineRuler.appendChild(mark);
}

// NOVA PISTA
addTrackBtn.onclick = ()=>{

    const index = tracks.length + 1;

    // TRACK
    const track = document.createElement("div");
    track.className = "track";

    // CLIP
    const clip = document.createElement("div");
    clip.className = "clip";
    clip.style.left = "100px";

    const title = document.createElement("div");
    title.className = "clip-title";
    title.innerText = "Track " + index;

    const waveform = document.createElement("div");
    waveform.className = "waveform";

    clip.appendChild(title);
    clip.appendChild(waveform);

    track.appendChild(clip);
    tracksContainer.appendChild(track);

    // MIXER CHANNEL
    const channel = document.createElement("div");
    channel.className = "channel-strip";

    channel.innerHTML = `
        <h3>Track ${index}</h3>

        <label>Volume</label>
        <input type="range" min="0" max="1" step="0.01" value="0.8">

        <br><br>

        <button>M</button>
        <button>S</button>
    `;

    mixer.appendChild(channel);

    makeDraggable(clip);

    tracks.push({
        track,
        clip,
        channel
    });
};

// DRAG CLIPS
function makeDraggable(element){

    let offsetX = 0;
    let dragging = false;

    element.addEventListener("mousedown", e=>{
        dragging = true;
        offsetX = e.clientX - element.offsetLeft;
    });

    document.addEventListener("mousemove", e=>{

        if(!dragging) return;

        let x = e.clientX - offsetX;

        if(x < 0) x = 0;

        element.style.left = x + "px";
    });

    document.addEventListener("mouseup", ()=>{
        dragging = false;
    });

    // TOUCH MOBILE
    element.addEventListener("touchstart", e=>{
        dragging = true;
        offsetX = e.touches[0].clientX - element.offsetLeft;
    });

    document.addEventListener("touchmove", e=>{

        if(!dragging) return;

        let x = e.touches[0].clientX - offsetX;

        if(x < 0) x = 0;

        element.style.left = x + "px";
    });

    document.addEventListener("touchend", ()=>{
        dragging = false;
    });
}

// PLAYHEAD
playBtn.onclick = ()=>{

    if(playing) return;

    playing = true;

    animatePlayhead();
};

stopBtn.onclick = ()=>{

    playing = false;

    cancelAnimationFrame(animation);

    playheadX = 0;
    playhead.style.left = "0px";

    timeDisplay.innerText = "0.0";
};

function animatePlayhead(){

    if(!playing) return;

    playheadX += 1;

    playhead.style.left = playheadX + "px";

    timeDisplay.innerText = (playheadX / 100).toFixed(1);

    animation = requestAnimationFrame(animatePlayhead);
}
