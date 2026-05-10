const tracksContainer =
document.getElementById("tracks");

const addTrackBtn =
document.getElementById("addTrack");

let tracks = [];

//////////////////////////////////////////////////////
// CREATE TRACK
//////////////////////////////////////////////////////

function createTrack(){

    const track =
    document.createElement("div");

    track.className = "track";

    track.innerHTML = `

    <div class="track-top">

        <div class="track-title">
        Track ${tracks.length + 1}
        </div>

        <div class="controls">

            <button class="rec">
            REC
            </button>

            <button class="stop">
            STOP
            </button>

            <button class="play">
            PLAY
            </button>

        </div>

        <audio controls></audio>

    </div>

    `;

    tracksContainer.appendChild(track);

    //////////////////////////////////////////////////////
    // ELEMENTS
    //////////////////////////////////////////////////////

    const recBtn =
    track.querySelector(".rec");

    const stopBtn =
    track.querySelector(".stop");

    const playBtn =
    track.querySelector(".play");

    const audio =
    track.querySelector("audio");

    //////////////////////////////////////////////////////
    // RECORDER
    //////////////////////////////////////////////////////

    let mediaRecorder;

    let chunks = [];

    let stream;

    //////////////////////////////////////////////////////
    // REC
    //////////////////////////////////////////////////////

    recBtn.onclick = async () => {

        try {

            //////////////////////////////////////////////////////
            // GET MIC
            //////////////////////////////////////////////////////

            stream =
            await navigator
            .mediaDevices
            .getUserMedia({

                audio:true

            });

            console.log(
            "MIC OK"
            );

            //////////////////////////////////////////////////////
            // MIME
            //////////////////////////////////////////////////////

            let mimeType =
            "audio/webm";

            if(

                MediaRecorder
                .isTypeSupported(
                    "audio/webm;codecs=opus"
                )

            ){

                mimeType =
                "audio/webm;codecs=opus";

            }

            //////////////////////////////////////////////////////
            // RECORDER
            //////////////////////////////////////////////////////

            mediaRecorder =
            new MediaRecorder(
                stream,
                {
                    mimeType
                }
            );

            chunks = [];

            //////////////////////////////////////////////////////
            // START
            //////////////////////////////////////////////////////

            mediaRecorder.start();

            console.log(
            "REC START"
            );

            recBtn.style.background =
            "red";

            //////////////////////////////////////////////////////
            // DATA
            //////////////////////////////////////////////////////

            mediaRecorder.ondataavailable =
            e => {

                console.log(
                "DATA",
                e.data.size
                );

                if(
                    e.data.size > 0
                ){

                    chunks.push(
                        e.data
                    );

                }

            };

            //////////////////////////////////////////////////////
            // STOP
            //////////////////////////////////////////////////////

            mediaRecorder.onstop =
            () => {

                console.log(
                "STOP OK"
                );

                const blob =
                new Blob(
                    chunks,
                    {
                        type:mimeType
                    }
                );

                const url =
                URL.createObjectURL(
                    blob
                );

                audio.src = url;

                audio.load();

                //////////////////////////////////////////////////////
                // STOP MIC
                //////////////////////////////////////////////////////

                stream
                .getTracks()
                .forEach(
                    t=>t.stop()
                );

                recBtn.style.background =
                "";

                console.log(
                "AUDIO READY"
                );

            };

        } catch(err){

            console.log(err);

            alert(
            "Erro: " +
            err.message
            );
        }
    };

    //////////////////////////////////////////////////////
    // STOP BUTTON
    //////////////////////////////////////////////////////

    stopBtn.onclick = () => {

        if(
            mediaRecorder &&
            mediaRecorder.state ===
            "recording"
        ){

            mediaRecorder.stop();

            console.log(
            "STOP CLICK"
            );

        }

    };

    //////////////////////////////////////////////////////
    // PLAY
    //////////////////////////////////////////////////////

    playBtn.onclick = () => {

        if(audio.src){

            audio.play();

        }else{

            alert(
            "Nada gravado."
            );

        }

    };

    tracks.push({
        audio
    });

}

//////////////////////////////////////////////////////
// ADD TRACK
//////////////////////////////////////////////////////

addTrackBtn.onclick =
createTrack;

//////////////////////////////////////////////////////
// START
//////////////////////////////////////////////////////

createTrack();
