// hello

// Aura zones
var TWO_PI = Math.PI * 2;

var default_opts = {
  radius: 100,
  position: [60, 60],
  color: "255,255,255",
  colDelta: 50,
  auraCircles: 1,
  circle_radius_ratio: [0.1, 0.9],
  ratio_circles_x: 0.5,
  ratio_circles_y: 0.5,
};

CanvasRenderingContext2D.prototype.appendAura = function(custom_opts) {

  var context = this;
  var opts = {};

  // Override default propterties
  for (var key_default in default_opts) {
    if (default_opts.hasOwnProperty(key_default)){
      opts[key_default] = default_opts[key_default];
    }
  }

  for (var key_custom in custom_opts) {
    if (custom_opts.hasOwnProperty(key_custom)){
      opts[key_custom] = custom_opts[key_custom];
    }
  }

  if(opts.position === null){
    opts.position = [[opts.radius, opts.radius]];
  }
  else if(opts.position instanceof Array && opts.position.length > 0 && !(opts.position[0] instanceof Array)){
    opts.position = [opts.position];
  }

  for(var p = 0; p < opts.position.length; p++ ) {
    for (var i = 0; i < opts.auraCircles; i++) {

      var circle_radius = opts.radius * opts.circle_radius_ratio;
      if(opts.circle_radius_ratio instanceof Array && opts.circle_radius_ratio.length === 2){
        circle_radius = opts.radius * (Math.random() * (opts.circle_radius_ratio[1] - opts.circle_radius_ratio[0]) + opts.circle_radius_ratio[0]);
      }

      // Compute a randomised circle position within the Aura.
      var angle = Math.random() * TWO_PI;
      var cx = opts.position[p][0] + Math.random() * Math.cos(angle) * (opts.radius - circle_radius) * opts.ratio_circles_x;
      var cy = opts.position[p][1] + Math.random() * Math.sin(angle) * (opts.radius - circle_radius) * opts.ratio_circles_y;
      var gradient = context.createRadialGradient(cx, cy, 0, cx, cy, circle_radius);

      var gradient_color = 'rgba(' + opts.color + ', ';
      gradient.addColorStop(0, gradient_color + '0.2)');
      gradient.addColorStop(1, gradient_color + '0)');

      context.beginPath();
      context.fillStyle = gradient;
      context.arc(cx, cy, circle_radius, 0, TWO_PI, true);
      context.fill();
      context.closePath();
    }
  }
  return this;
};


// Basic helper functions from face-api demo
function resizeCanvasAndResults(dimensions, canvas, results) {
  const { width, height } = dimensions instanceof HTMLVideoElement
    ? faceapi.getMediaDimensions(dimensions)
    : dimensions
  canvas.width = width
  canvas.height = height
  return results.map(res => res.forSize(width, height))
}

function drawDetections(dimensions, canvas, detections) {
  const resizedDetections = resizeCanvasAndResults(dimensions, canvas, detections)
  faceapi.drawDetection(canvas, resizedDetections)
}

function drawLandmarks(dimensions, canvas, results) {
  const resizedResults = resizeCanvasAndResults(dimensions, canvas, results)
  faceapi.drawDetection(canvas, resizedResults.map(det => det.detection))
}

// Chakra colors
var colors = [
     ['231, 24, 55'], // red 
     ['255,170,170'], // pink  
     ['255,0,255'], // magenta
     ['252,147,3'], // orange
     ['252,233,3'], // yellow
     ['176,142,103'], // tan
     ['73,182,117'], // green
     ['14,75,239'], // blue
     ['6,184,185'], // turquoise
     ['75,0,130'], // indigo
     ['104,77,119'], // violet
     ['255,255,255'], // white
    ];

function createAura(result){

  var canvasArr = document.querySelectorAll("canvas");
  var ctx = [];
  var i = canvasArr.length;
  while(i--){
    ctx[i] = canvasArr[i].getContext("2d");
  }

  let x = result._detection._box._x;
  let y = result._detection._box._y;
  let w = result._detection._box._width;
  let h = result._detection._box._height;

  ctx[0].globalAlpha = 0.25;

  // the six aura areas: right, left, top, thought, throat, heart

  // right side
  ctx[0].appendAura({
    position: [[x+w+100, y+(h/2)-100]],
    radius: h+150,
    color: randColors[0].toString(),
    ratio_circles_y: 1,
  });  

  // left side
  ctx[0].appendAura({
    position: [[x-100, y+(h/2)-100]],
    radius: h+150,
    color: randColors[1].toString(),
    ratio_circles_x: 1,
  });  

  // top
  ctx[0].appendAura({
    position: [[x+(w/2)-150, y-150],[x+(w/2), y-150],[x+(w/2)+150, y-150]],
    radius: w+150,
    color: randColors[2].toString(),
    ratio_circles_y: 0,
    ratio_circles_x: 1,
  });  

  // throat
  ctx[0].appendAura({
    position: [[x+(w/2), y+h]],
    radius: w-50,
    color: randColors[4].toString(),
    ratio_circles_y: 1,
  });  

  // heart
  ctx[0].appendAura({
    position: [[x+(w/2), y+h+100]],
    radius: w,
    color: randColors[5].toString(),
    ratio_circles_x: 0,
  });

}

var colorMixer = function(){
  var arr = [];
  for (var i = 0; i < 6; i++) {
    arr.push(colors[Math.floor(Math.random() * Math.floor(11))])
  }
  return arr;
};


// set colors and counter once, here
randColors = colorMixer();
let counter = 100

// start the party!
async function onPlay() {
  const vidElement = document.getElementById('inputVideo')
  const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 128, scoreThreshold : 0.3 })

  let result = await faceapi.detectSingleFace(vidElement, options).withFaceLandmarks(true)

  if (result) {
    if (counter > 0) {
      createAura(result)
      counter--
      let view = document.getElementById('counter')
      view.style.display = "block"
      view.innerHTML = counter.toString()

      if (counter == 0) {
        view.classList.add('hide')
      }
    }
  }

  setTimeout(() => onPlay())
}

// lets go
async function run() {
   await faceapi.loadTinyFaceDetectorModel(window.location.href)
   await faceapi.loadFaceLandmarkTinyModel(window.location.href)
   const stream = await navigator.mediaDevices.getUserMedia({video:{}})
   const vidElement = document.getElementById('inputVideo')
   vidElement.srcObject = stream
}

async function stop(){
  const vidElement = document.getElementById('inputVideo')
  const stream = vidElement.srcObject;
  const tracks = stream.getTracks();

  tracks.forEach(function(track) {
    track.stop();
  });
}