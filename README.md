<div align="center">
  <img src="https://raw.githubusercontent.com/moriyuzan/p5js.paper/main/public/splash.png" alt="p5.paper splash image" width="600px" />
  <br>
  A high-performance WebGL post-processing library for authentic paper textures in p5.js.
  <br><br>

  [![npm version](https://img.shields.io/npm/v/p5.paper.svg)](https://www.npmjs.com/package/p5.paper)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
</div>

---

# p5.paper

A p5.js shader library for realistic paper textures, grain, color bleed, and blemishes.

This repo currently contains:

* The core `p5Paper` post-processing class in `src/index.js`
* GLSL shaders in `src/shaders/paper.vert` and `src/shaders/paper.frag`
* A Vite-powered demo sketch using `main.js` and `index.html`

## Demo

[Try the demo on OpenProcessing!](https://openprocessing.org/sketch/2890331)

## Development

**Using a CDN (Quick Setup):**

You can easily include the library without downloading or installing anything by adding a CDN link directly to your HTML `<head>`:

```html
<!-- Using jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/p5.paper"></script>

<!-- OR using unpkg -->
<script src="https://unpkg.com/p5.paper"></script>
```

Install dependencies and run the local demo server:

```bash
npm install
npm run dev
```

## Building for Production

To compile the library shaders and logic into the `dist/` folder for production use, run:

```bash
npm run build
```

This will automatically generate both ES Module (`p5.paper.es.js`) and UMD (`p5.paper.umd.js`) formats.

## Usage

Once built, or when installed via npm, you can pull the compiled files directly into your project.

**Using ES Modules (Recommended for modern workflows like Vite/Webpack):**

```html
<script type="module">
  import p5Paper from './dist/p5.paper.es.js';
  
  // Initialize and use p5Paper in your sketch
</script>
```

**Traditional p5.js Example (Classic HTML `<head>` Inclusion):**

For standard global p5.js projects, include the library in your `<head>` right after p5.js. Because this is a post-processing effect, you must draw your artwork to an off-screen buffer (`createGraphics`) and then pass that buffer to `p5.paper`.

Here is a complete, working example:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>My p5.paper Sketch</title>
    <!-- 1. Load p5.js first -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
    <!-- 2. Load the p5.paper UMD file -->
    <script src="./dist/p5.paper.umd.js"></script>
  </head>
  <body>
    <script>
      let paper;
      let drawBuffer;
      
      function setup() {
        createCanvas(800, 600);
        
        // 1. Create an off-screen buffer to draw your art
        drawBuffer = createGraphics(width, height);
        drawBuffer.background('#f4f1ea');
        
        // 2. Initialize the p5.paper library globally
        paper = new p5Paper(width, height);
      }

      function draw() {
        // 3. Draw your artwork onto the buffer (NOT the main canvas)
        if (mouseIsPressed) {
          drawBuffer.noStroke();
          drawBuffer.fill(20, 25, 30, 50);
          drawBuffer.circle(mouseX, mouseY, 20);
        }

        // 4. Define your paper texture parameters
        const params = {
            tex: 0.15,      // Procedural grooves (0 - 0.5)
            grit: 0.30,     // Blemishes/dirt (0 - 1.0)
            grain: 0.12,    // Micro grain (0 - 0.5)
            vignette: 0.60, // Edge darkening (0 - 1.5)
            bleed: 0.003    // Color bleed/chromatic effect (0 - 0.02)
        };

        // 5. Apply the shader effect to the buffer and draw to the main screen
        let finalImage = paper.apply(drawBuffer, params);
        image(finalImage, 0, 0);
      }
    </script>
  </body>
</html>
```

## Blend Modes

The paper shader exposes multiple blend modes via the `u_blend_mode` uniform when combining the source image with a custom image texture:

- **0 – Multiply**: Multiplies the source and image colors (`color * imgColor`).
- **1 – Lighten**: Keeps the lighter value of each channel (`max(color, imgColor)`).
- **2 – Subtractive Darken**: Darkens based on the inverse of the image’s red channel.
- **3 – Overlay**: Multiplies dark areas and screens light areas (classic overlay blend).
- **4 – Screen**: Inverts, multiplies, then inverts again (screen blend).
- **5 – Darken**: Keeps the darkest value of each channel (`min(color, imgColor)`).
- **6 – Difference**: Uses the absolute difference between source and image colors.

## Effects

p5.paper exposes the following post-processing effects, controlled via the `params` object passed to `paper.apply`:

- **`tex` – Procedural grooves**: Simulated paper fibers / grooves.
- **`grit` – Grittiness / blemishes**: Dirt, specks, and surface imperfections.
- **`grain` – Micro grain**: Fine-grain noise over the image.
- **`vignette` – Vignette**: Edge darkening from the center outward.
- **`bleed` – Color bleed**: Chromatic/color bleed effect on edges.
- **`imgTex` – Image texture intensity**: Strength of the custom seamless image map.
- **`imgScale` – Image tiling scale**: Tiling scale of the custom image map.
