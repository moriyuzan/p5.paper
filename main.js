import p5Paper from './src/index.js';

let drawBuffer;
let paper;

function setup() {
  createCanvas(1600, 1200);
  drawBuffer = createGraphics(width, height);
  drawBuffer.background('#f4f1ea');

  paper = new p5Paper(width, height);

  // Load default paper texture from public/paper-tex.png
  loadImage('paper-tex.png', (img) => {
    paper.setCustomTexture(img);
  });

  document.getElementById('texSlider').value = 0.05;
  document.getElementById('gritSlider').value = 0.10;
  document.getElementById('grainSlider').value = 0.05;
  document.getElementById('vigSlider').value = 0.26;
  document.getElementById('bleedSlider').value = 0.001;
  document.getElementById('imgTexSlider').value = 0.50;
  document.getElementById('imgScaleSlider').value = 1.6;

  document.getElementById('imageUpload').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      loadImage(fileURL, (img) => {
        paper.setCustomTexture(img);
      });
    }
  });
}

function draw() {
  const isOverUI = mouseX > 0 && mouseX < 320 && mouseY > 0 && mouseY < 550;
  if (mouseIsPressed && !isOverUI) {
    drawSimulatedInk(mouseX, mouseY, pmouseX, pmouseY);
  }

  const params = {
    tex: parseFloat(document.getElementById('texSlider').value),
    grit: parseFloat(document.getElementById('gritSlider').value),
    grain: parseFloat(document.getElementById('grainSlider').value),
    vignette: parseFloat(document.getElementById('vigSlider').value),
    bleed: parseFloat(document.getElementById('bleedSlider').value),
    imgTex: parseFloat(document.getElementById('imgTexSlider').value),
    imgScale: parseFloat(document.getElementById('imgScaleSlider').value)
  };

  document.getElementById('texVal').innerText = params.tex.toFixed(2);
  document.getElementById('gritVal').innerText = params.grit.toFixed(2);
  document.getElementById('grainVal').innerText = params.grain.toFixed(2);
  document.getElementById('vigVal').innerText = params.vignette.toFixed(2);
  document.getElementById('bleedVal').innerText = params.bleed.toFixed(3);
  document.getElementById('imgTexVal').innerText = params.imgTex.toFixed(2);
  document.getElementById('imgScaleVal').innerText = params.imgScale.toFixed(1);

  const finalImage = paper.apply(drawBuffer, params);
  image(finalImage, 0, 0);
}

function drawSimulatedInk(x, y, px, py) {
  let speed = dist(x, y, px, py);
  let brushSize = map(speed, 0, 50, 20, 2);
  brushSize = constrain(brushSize, 2, 20);

  drawBuffer.noStroke();
  drawBuffer.fill(20, 25, 30, 15);
  for (let i = 0; i < 5; i++) {
    const offsetX = random(-brushSize / 3, brushSize / 3);
    const offsetY = random(-brushSize / 3, brushSize / 3);
    drawBuffer.circle(x + offsetX, y + offsetY, brushSize + random(-2, 5));
  }
}

function keyPressed() {
  if (key === 'p') {
    drawBuffer.background('#ffffff');
  }
}

window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;

