// DAW VOV PRO — app.js // versão mínima estável Android Chrome

const tracksContainer = document.getElementById('tracks'); const addTrackBtn = document.getElementById('addTrack'); const playBtn = document.getElementById('play'); const stopBtn = document.getElementById('stop'); const timeDisplay = document.getElementById('time');

let tracks = []; let timer = null; let seconds = 0;

function clockStart() { clearInterval(timer);

timer = setInterval(() => { seconds += 0.1; timeDisplay.innerText = seconds.toFixed(1); }, 100); }

function clockStop() { clearInterval(timer); }

function createTrack() {

const track = { recorder: null, chunks: [], audio: null, blob: null, stream: null };

const div = document.createElement('div'); div.className = 'track';

div.innerHTML = ` <div class="track-title">Track ${tracks.length + 1}</div>

<div class="track-buttons">
  <button class="rec">REC</button>
  <button class="playtrack">▶</button>
  <button class="stoptrack">■</button>
  <button class="remove">X</button>
</div>

<audio controls></audio>

`;

tracksContainer.appendChild(div);

const recBtn = div.querySelector('.rec'); const playTrackBtn = div.querySelector('.playtrack'); const stopTrackBtn = div.querySelector('.stoptrack'); const removeBtn = div.querySelector('.remove'); const audioEl = div.querySelector('audio');

// ===================== // REC // =====================

recBtn.onclick = async () => {

try {

  // limpa anterior
  track.chunks = [];

  // microfone
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true
  });

  track.stream = stream;

  // recorder
  const recorder = new MediaRecorder(stream);

  track.recorder = recorder;

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      track.chunks.push(e.data);
    }
  };

  recorder.onstop = () => {

    const blob = new Blob(track.chunks, {
      type: 'audio/webm'
    });

    track.blob = blob;

    const url = URL.createObjectURL(blob);

    audioEl.src = url;

    track.audio = new Audio(url);

    // encerra microfone
    stream.getTracks().forEach(t => t.stop());

    recBtn.style.background = '';
  };

  recorder.start();

  recBtn.style.background = 'red';

  clockStart();

  console.log('gravando');

} catch (err) {

  alert('Falha no microfone');
  console.error(err);
}

};

// ===================== // STOP TRACK // =====================

stopTrackBtn.onclick = () => {

if (track.recorder && track.recorder.state === 'recording') {
  track.recorder.stop();
}

if (track.audio) {
  track.audio.pause();
  track.audio.currentTime = 0;
}

clockStop();

};

// ===================== // PLAY TRACK // =====================

playTrackBtn.onclick = async () => {

try {

  if (!track.audio) {
    alert('Nada gravado');
    return;
  }

  track.audio.currentTime = 0;

  await track.audio.play();

} catch (err) {
  console.error(err);
}

};

// ===================== // REMOVE // =====================

removeBtn.onclick = () => {

if (track.audio) {
  track.audio.pause();
}

div.remove();

};

tracks.push(track); }

// ===================== // PLAY ALL // =====================

playBtn.onclick = async () => {

for (const track of tracks) {

if (track.audio) {

  try {
    track.audio.currentTime = 0;
    await track.audio.play();
  } catch(e) {
    console.log(e);
  }
}

} };

// ===================== // STOP ALL // =====================

stopBtn.onclick = () => {

tracks.forEach(track => {

if (track.audio) {
  track.audio.pause();
  track.audio.currentTime = 0;
}

if (track.recorder && track.recorder.state === 'recording') {
  track.recorder.stop();
}

});

seconds = 0; timeDisplay.innerText = '0.0';

clockStop(); };

// ===================== // NOVA TRACK // =====================

addTrackBtn.onclick = () => { createTrack(); };

// inicia createTrack();
