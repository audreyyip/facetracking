console.log("sketch.js loaded");

let video;
let faceMesh;
let faces = [];

function preload() {
  faceMesh = ml5.faceMesh({ flipped: true });
}

function gotFaces(results) {
  faces = results;
}

function setup() {
  createCanvas(640, 480);
  background(100);

  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      console.log("✅ getUserMedia works! Stream:", stream);

      video = createCapture(VIDEO, { flipped: true }, () => {
        console.log("✅ p5 camera ready, size:", video.width, video.height);
        faceMesh.detectStart(video, gotFaces);
      });
      video.hide();

    })
    .catch((err) => {
      console.error("❌ Camera error:", err.name, err.message);
    });
}

function draw() {
  if (!video || video.width === 0) {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(16);
    text("Waiting for camera...", width / 2, height / 2);
    return;
  }

  image(video, 0, 0, width, height);

  for (let face of faces) {
    for (let i = 0; i < face.keypoints.length; i++) {
      let keypoint = face.keypoints[i];
      fill(255, 255, 0);
      noStroke();
      circle(keypoint.x, keypoint.y, 5);
    }
  }
}