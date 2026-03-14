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

---

## Using p5.paper with p5.brush

[p5.brush](https://github.com/acamposuribe/p5.brush) is a natural drawing library for p5.js — pencils, charcoal, markers, watercolor fills, and hatch patterns. The two libraries complement each other naturally: p5.brush produces the artwork, p5.paper makes it feel like it was drawn on physical paper.

### How they fit together

Because p5.brush requires a **WEBGL canvas**, and p5.paper applies its shader pass to a separate buffer, you need one extra surface — a WEBGL `p5.Graphics` buffer — that sits between the two:

```
p5.Graphics buffer (WEBGL)
  └── brush draws into it via brush.load(pg)
        └── paper.apply(pg, params) reads it as a texture
              └── p.image(result, 0, 0) displays the composited output
```

### Loading order

p5.brush ships as a **UMD bundle** that must be loaded as a plain `<script>` tag — it cannot be ES-module imported. p5.paper can be imported normally as an ES module. Load them in this order:

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="https://cdn.jsdelivr.net/npm/p5@2.1.1/lib/p5.min.js"></script>
    <!-- p5.brush must be a plain script tag, not an ES module import -->
    <script src="https://cdn.jsdelivr.net/npm/p5.brush"></script>
  </head>
  <body>
    <script type="module" src="/main.js"></script>
  </body>
</html>
```

Then in your module file, reference `brush` from `window` and import p5.paper normally:

```javascript
import p5 from 'p5';
import p5Paper from 'p5.paper';

const brush = window.brush;
```

### Complete working example

```javascript
import p5 from 'p5';
import p5Paper from 'p5.paper';

const brush = window.brush;

const W = 700;
const H = 500;

const sketch = (p) => {
  let pg;    // WEBGL graphics buffer — brush draws here
  let paper; // p5Paper reads from pg, outputs shader result

  p.setup = () => {
    // Tell p5.brush which p5 instance to use
    brush.instance(p);

    // Main canvas must be WEBGL — required by p5.brush
    p.createCanvas(W, H, p.WEBGL);
    p.imageMode(p.CORNER);
    p.angleMode(p.DEGREES);

    // Off-screen WEBGL buffer that brush will draw into
    // p5.paper will read this as its source texture
    pg = p.createGraphics(W, H, p.WEBGL);
    pg.angleMode(p.DEGREES);
    pg.background('#f4f1ea'); // paper base color

    // Initialize p5.paper — pass p so it uses instance-mode createGraphics
    paper = new p5Paper(W, H, p);

    // Point brush at the offscreen buffer and draw your scene
    brush.load(pg);
    brush.scaleBrushes(4);

    // CRITICAL: pg is a WEBGL buffer — its origin is the CENTER, not the
    // top-left. Without this translate, all your coordinates are measured
    // from the middle of the buffer and shapes appear off-screen or clipped.
    pg.push();
    pg.translate(-W / 2, -H / 2);

    brush.noField();
    brush.noClip();

    p.randomSeed(42);
    p.noiseSeed(42);
    brush.set('HB', '#21313f', 1);
    brush.noFill();
    brush.line(60, 80, 420, 180);

    p.randomSeed(43);
    p.noiseSeed(43);
    brush.noStroke();
    brush.fill('#174d71', 90);
    brush.circle(200, 320, 80);

    pg.pop(); // restores the WEBGL origin

    // Restore brush to the main canvas when done
    brush.load();

    p.noLoop();
  };

  p.draw = () => {
    // WEBGL origin is center — shift to top-left coordinates
    p.translate(-W / 2, -H / 2);

    // Apply paper texture shader and draw to screen
    const result = paper.apply(pg, {
      tex:      0.15,  // procedural paper grooves    (0 – 0.5)
      grit:     0.30,  // blemishes / dirt            (0 – 1.0)
      grain:    0.12,  // micro grain noise           (0 – 0.5)
      vignette: 0.60,  // edge darkening              (0 – 1.5)
      bleed:    0.003, // chromatic color bleed       (0 – 0.02)
    });
    p.image(result, 0, 0);
  };
};

new p5(sketch);
```

### Key rules

- **`pg.push()` / `pg.translate(-W / 2, -H / 2)` / `pg.pop()` wraps all brush drawing** — this is the most common gotcha. `pg` is a WEBGL buffer whose origin sits at the center, not the top-left. Every coordinate you pass to `brush.line()`, `brush.rect()`, `brush.circle()` etc. is measured from that center. Without this translate, shapes that appear to be at `(W * 0.7, H * 0.6)` are actually off-screen, and only strokes that start near `(0, 0)` happen to land near the visible center. Wrapping with `pg.push() / pg.translate(-W/2, -H/2) / pg.pop()` makes all coordinates behave as expected top-left relative.
- **`brush.load(pg)` before drawing, `brush.load()` after** — brush must know which surface to target. Forgetting to restore with `brush.load()` leaves brush pointed at `pg`, which will break anything drawn to the main canvas afterward.
- **`pg` must be WEBGL** — p5.brush's blending system requires a WebGL2 context. Passing a 2D graphics buffer will throw.
- **`brush.scaleBrushes()` should match your canvas size** — the default brush sizes are calibrated for small canvases. At 700×500 use `scaleBrushes(2)`, at 1200×1200 use `scaleBrushes(4)`. Too small a scale and strokes render as invisible hairlines.
- **`new p5Paper(W, H, p)`** — the third argument tells p5.paper to use `p.createGraphics` instead of the global. This is required in instance mode and harmless in global mode.
- **`p.translate(-W / 2, -H / 2)` at the top of `draw()`** — the main canvas is also WEBGL, so `p.image(result, 0, 0)` needs the same origin shift or the output renders offset from the top-left corner.
- **p5.brush is a global, not an ES module** — never do `import * as brush from 'p5.brush'`. The npm package's entry point is the UMD dist bundle and ES module imports will fail silently or throw runtime errors. Always load it via `<script>` and access it as `window.brush`.
