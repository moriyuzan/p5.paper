import vertShader from './shaders/paper.vert';
import fragShader from './shaders/paper.frag';

class p5Paper {
  constructor(w, h, p) {
    this.width = w;
    this.height = h;
    // Accept a p5 instance for instance mode; fall back to globals for global mode
    const _createGraphics = p ? p.createGraphics.bind(p) : createGraphics;
    const _WEBGL = p ? p.WEBGL : WEBGL;
    this.fxBuffer = _createGraphics(w, h, _WEBGL);
    this.fxBuffer.noStroke();
    this.paperShader = this.fxBuffer.createShader(vertShader, fragShader);
    this.customImageMap = null;
  }

  setCustomTexture(img) {
    this.customImageMap = img;
  }

  apply(sourceCanvas, params = {}) {
    const p = {
      tex:       0.12,
      grit:      0.20,
      grain:     0.10,
      vignette:  0.50,
      bleed:     0.002,
      imgTex:    0.50,
      imgScale:  1.00,
      blendMode: 0,
      ...params,
    };

    this.fxBuffer.shader(this.paperShader);

    this.paperShader.setUniform('tex0', sourceCanvas);
    this.paperShader.setUniform('u_resolution', [this.width, this.height]);
    this.paperShader.setUniform('u_grain_amount', p.grain);
    this.paperShader.setUniform('u_vignette_amount', p.vignette);
    this.paperShader.setUniform('u_bleed_offset', p.bleed);
    this.paperShader.setUniform('u_texture_amount', p.tex);
    this.paperShader.setUniform('u_grit_amount', p.grit);

    if (this.customImageMap) {
      this.paperShader.setUniform('u_has_image_tex', true);
      this.paperShader.setUniform('u_image_tex', this.customImageMap);
      this.paperShader.setUniform('u_img_tex_amount', p.imgTex);
      this.paperShader.setUniform('u_img_tex_scale', p.imgScale);
      this.paperShader.setUniform('u_blend_mode', p.blendMode);
    } else {
      this.paperShader.setUniform('u_has_image_tex', false);
    }

    this.fxBuffer.rect(-this.width / 2, -this.height / 2, this.width, this.height);
    return this.fxBuffer;
  }
}

export default p5Paper;
