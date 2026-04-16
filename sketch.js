let capture;
let faceapi;
let detections = [];

let capturewidth, captureheight;
let scalar = 1; // Used to scale UI elements based on screen size

let emotions = ["neutral", "happy", "sad", "angry", "fearful", "disgusted", "surprised"];

function setup() {
  // 1. RESPONSIVE DIMENSIONS
  // If the screen is taller than it is wide (Portrait), use windowWidth
  if (windowWidth < windowHeight) {
    capturewidth = windowWidth;
    captureheight = windowWidth * (4 / 3); // Maintain 4:3 camera aspect ratio
  } else {
    // Landscape / Desktop
    capturewidth = 960;
    captureheight = 720;
  }

  // Calculate scalar based on a base width of 960
  scalar = capturewidth / 960;

  // Create and center the canvas
  let cnv = createCanvas(capturewidth, captureheight);
  cnv.position((windowWidth - width) / 2, (windowHeight - height) / 2);

  // 2. MOBILE-FRIENDLY CAPTURE
  const constraints = {
    video: {
      width: { ideal: capturewidth },
      height: { ideal: captureheight },
      facingMode: 'user' // Uses front camera on mobile
    },
    audio: false
  };

  capture = createCapture(constraints);
  capture.elt.setAttribute('playsinline', ''); // Essential for iOS
  capture.hide(); // Hides the extra video element below the canvas

  // 3. INITIALIZE FACE API
  const faceOptions = {
    withLandmarks: true,
    withExpressions: true,
    withDescriptors: false,
    flipHorizontal: false // We handle mirroring manually in draw()
  };

  faceapi = ml5.faceApi(capture, faceOptions, faceReady);
}

function faceReady() {
  console.log("FaceAPI Model Loaded");
  faceapi.detect(gotFaces);
}

function gotFaces(error, result) {
  if (error) {
    console.log(error);
    return;
  }
  detections = result;
  faceapi.detect(gotFaces);
}

function draw() {
  background(0);

  // --- MIRRORING SECTION ---
  push();
  // Flip the canvas horizontally
  translate(width, 0);
  scale(-1, 1);

  // Only draw video if it's ready
  if (capture.loadedmetadata) {
    image(capture, 0, 0, width, height);
  }

  // Draw landmarks
  if (detections.length > 0) {
    fill(0, 255, 0);
    noStroke();
    for (let i = 0; i < detections.length; i++) {
      let points = detections[i].landmarks.positions;
      for (let j = 0; j < points.length; j++) {
        // Dot size scales with screen size
        circle(points[j]._x, points[j]._y, 5 * scalar);
      }
    }
  }
  pop(); // End of mirrored section

  // --- NON-MIRRORING UI SECTION ---
  // Text needs to be drawn outside the mirrored push/pop so it's readable
  if (detections.length > 0) {
    drawUI();
  }
}

function drawUI() {
  // Dynamic font sizing based on scalar
  let baseTextSize = 20 * scalar;
  let margin = 30 * scalar;
  
  textSize(baseTextSize);
  textAlign(LEFT);

  for (let i = 0; i < detections.length; i++) {
    for (let k = 0; k < emotions.length; k++) {
      let thisEmotion = emotions[k];
      let level = detections[i].expressions[thisEmotion];

      let yPos = margin + (margin * k);
      
      fill(255);
      text(thisEmotion.toUpperCase() + ": " + nf(level, 1, 2), 20 * scalar, yPos);
      
      // Emotion Bar
      fill(0, 255, 0);
      rect(20 * scalar, yPos + (5 * scalar), level * (150 * scalar), 8 * scalar);
    }
  }
}

// Ensure the sketch reloads if the user