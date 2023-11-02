const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');
const disableWebcamButton = document.getElementById('disableWebcamButton');
const fileSelector = document.getElementById('img');
const bruh = document.getElementById('pls');
var MediaStream;
var model = undefined;
window.onload = async () => {
    console.log("Webpage loaded!");
    cocoSsd.load().then(function(loadedModel) {
        console.log("Model loaded!");
        model = loadedModel;
        bruh.innerHTML = "Model loaded!";
        bruh.classList.add('removed');
        fileSelector.disabled = false;
        enableWebcamButton.disabled = false;
    });
};
// Check if webcam access is supported.
function getUserMediaSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// If webcam supported, add event listener to button for when user
// wants to activate it to call enableCam function which we will 
// define in the next step.
if (getUserMediaSupported()) {
    enableWebcamButton.addEventListener('click', enableCam);
    disableWebcamButton.addEventListener('click', disableCam);
} else {
    console.warn('getUserMedia() is not supported by your browser');
}

  // Enable the live webcam view and start classification.
function enableCam(event) {
    // Only continue if the COCO-SSD has finished loading.
    if (!model) {
        return;
    }

    // Hide the button once clicked.
    event.target.classList.add('removed');
    disableWebcamButton.classList.remove('removed');

    // getUsermedia parameters to force video but not audio.
    const constraints = {
        video: true
    };

    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        MediaStream = stream.getTracks();
        video.srcObject = stream;
        video.classList.remove('removed');
        video.addEventListener('loadeddata', predictWebcam);
        console.log("Webcam stream turned on!");
    });
}

function disableCam() {
    enableWebcamButton.classList.remove('removed');
    disableWebcamButton.classList.add('removed');
    video.classList.add('removed');
    MediaStream.forEach(track => track.stop());
    console.log("Webcam stream turned off!");
}

var children = [];

function predictWebcam() {
  // Now let's start classifying a frame in the stream.
  model.detect(video).then(function (predictions) {
    // Remove any highlighting we did previous frame.
    for (let i = 0; i < children.length; i++) {
      liveView.removeChild(children[i]);
    }
    children.splice(0);
    
    // Now lets loop through predictions and draw them to the live view if
    // they have a high confidence score.
    for (let n = 0; n < predictions.length; n++) {
      console.log(predictions[n]);
      // If we are over 66% sure we are sure we classified it right, draw it!
      if (predictions[n].score > 0.66) {
        const p = document.createElement('p');
        p.innerText = predictions[n].score.toFixed(4) * 100 + "% certainty - " + predictions[n].class;
        p.style = 'left: ' + predictions[n].bbox[0] + 'px;' +
            'top: ' + predictions[n].bbox[1] + 'px;' + 
            'width: ' + (predictions[n].bbox[2] - 10) + 'px;';


        const highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'highlighter');
        highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
            + predictions[n].bbox[1] + 'px; width: ' 
            + predictions[n].bbox[2] + 'px; height: '
            + predictions[n].bbox[3] + 'px;';

        liveView.appendChild(highlighter);
        liveView.appendChild(p);
        children.push(highlighter);
        children.push(p);
      }
    }
    
    // Call this function again to keep predicting when the browser is ready.
    window.requestAnimationFrame(predictWebcam);
  });
}

fileSelector.onchange = async () => {
    var image = document.getElementById('imgshow');
    image.src = URL.createObjectURL(event.target.files[0]);
    image.style = "display: block;";
    const img = document.getElementById('imgshow');
    const model = await cocoSsd.load();
    const result = await model.detect(image);
    console.log(result);
    const c = document.getElementById('canvas');
    c.width = img.width;
    c.height = img.height;
    const context = c.getContext('2d');
    context.drawImage(image, 0, 0);
    context.font = '10 px Arial';
    for (let i = 0; i < result.length; i++) {
        context.beginPath();
        context.rect(...result[i].bbox);
        context.linewidth = 5;
        context.strokeStyle = 'green';
        context.fillStyle = 'green';
        context.stroke();
        context.fillText(result[i].score.toFixed(4) * 100 + '% certainty - ' + result[i].class, result[i].bbox[0], result[i].bbox[1] > 10 ? result[i].bbox[1] - 5 : 10);
        console.log("Process finished!");
    }
};

function changeImage() {
    var image = document.getElementById('imgshow');
    image.src = URL.createObjectURL(event.target.files[0]);
    image.style = "display: block;";
    const img = document.getElementById('imgshow');
    const model = cocoSsd.load();
    model.then(function(loadedModel) {
        console.log("Model loaded!");
        model = loadedModel;
        bruh.innerHTML = "Model loaded!";
        bruh.classList.add('removed');
        fileSelector.disabled = false;
        enableWebcamButton.disabled = false;
    });
    model.then(function(loadedModel) {
        loadedModel.detect(img).then(function(result) {
            console.log(result);
            const c = document.getElementById('canvas');
            c.width = img.width;
            c.height = img.height;
            const context = c.getContext('2d');
            context.drawImage(img, 0, 0);
            context.font = '10 px Arial';
            for (let i = 0; i < result.length; i++) {
                context.beginPath();
                context.rect(...result[i].bbox);
                context.linewidth = 5;
                context.strokeStyle = 'green';
                context.fillStyle = 'green';
                context.stroke();
                context.fillText(result[i].score.toFixed(4) * 100 + '% certainty - ' + result[i].class, result[i].bbox[0], result[i].bbox[1] > 10 ? result[i].bbox[1] - 5 : 10);
                console.log("Process finished!");
            }
        });
    });
}