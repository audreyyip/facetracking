let capture;
let capturewidth = 1920;    
let captureheight = 1080;

let emotions = ["neutral", "happy", "sad", "angry", "fearful", "disgusted", "surprised"];

// Emotion visuals: each entry has a label color and a draw function
let emotionVisuals = {
  happy:     () => { fill('#FFD700'); noStroke(); star(width/2, height/2, 40, 80, 5); },
  sad:       () => { fill('#6495ED'); noStroke(); ellipse(width/2, height/2, 80, 40); },
  angry:     () => { fill('#FF4500'); noStroke(); triangle(width/2, height/2 - 60, width/2 - 50, height/2 + 40, width/2 + 50, height/2 + 40); },
  fearful:   () => { fill(255, 255, 100, 180); noStroke(); for(let i=0;i<5;i++) ellipse(width/2 + random(-100,100), height/2 + random(-100,100), 20, 20); },
  disgusted: () => { fill('#32CD32'); noStroke(); rect(width/2 - 40, height/2 - 40, 80, 80, 10); },
  surprised: () => { fill('#FF69B4'); noStroke(); ellipse(width/2, height/2, 100, 100); },
  neutral:   () => { fill('#AAAAAA'); noStroke(); rect(width/2 - 60, height/2 - 10, 120, 20, 5); }
};

let faceapi;
let detections = [];

function setup() {
  createCanvas(capturewidth, captureheight);
  
  // Constrain video to match canvas resolution
  capture = createCapture({ video: { width: capturewidth, height: captureheight } });
  capture.position(0, 0);
  capture.hide();
  
  const faceOptions = { withLandmarks: true, withExpressions: true, withDescriptors: false };
  faceapi = ml5.faceApi(capture, faceOptions, faceReady);
}

function faceReady() {
  faceapi.detect(gotFaces);
}

function gotFaces(error, result) {
  if (error) { console.log(error); return; }
  detections = result;
  faceapi.detect(gotFaces);
}

// Helper: draw a 5-point star
function star(x, y, r1, r2, npoints) {
  let angle = TWO_PI / npoints;
  let half = angle / 2;
  beginShape();
  for (let a = -HALF_PI; a < TWO_PI - HALF_PI; a += angle) {
    vertex(x + cos(a) * r2, y + sin(a) * r2);
    vertex(x + cos(a + half) * r1, y + sin(a + half) * r1);
  }
  endShape(CLOSE);
}

function draw() {
  background(0);
  capture.loadPixels();

  push();
  fill('green');
  
  if (detections.length > 0) {
    for (let i = 0; i < detections.length; i++) {
      
      // Draw landmarks
      let points = detections[i].landmarks.positions;
      for (let j = 0; j < points.length; j++) {
        circle(points[j]._x, points[j]._y, 5);
      }

      // Draw emotion bars + percentages
      push();
      textSize(20);
      for (let k = 0; k < emotions.length; k++) {
        let thisemotion = emotions[k];
        let thisemotionlevel = detections[i].expressions[thisemotion];
        let pct = (thisemotionlevel * 100).toFixed(1) + "%";  // ← decimal → percentage

        fill('green');
        text(thisemotion + ": " + pct, 40, 50 + 50 * k);
        rect(40, 60 + 50 * k, thisemotionlevel * 200, 20);

        // ← Conditional visual: show themed element if emotion ≥ 60%
        if (thisemotionlevel >= 0.6 && emotionVisuals[thisemotion]) {
          push();
          emotionVisuals[thisemotion]();
          pop();
        }
      }
      pop();
    }
  }
  
  pop();
}