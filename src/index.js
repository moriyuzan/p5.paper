import vertShader from './shaders/paper.vert';
import fragShader from './shaders/paper.frag';

class p5Paper {
  constructor(w, h) {
    this.width = w;
    this.height = h;
    this.fxBuffer = createGraphics(w, h, WEBGL);
    this.fxBuffer.noStroke();
    this.paperShader = this.fxBuffer.createShader(vertShader, fragShader);
    this.customImageMap = null;
  }

  setCustomTexture(img) {
    this.customImageMap = img;
  }

  apply(sourceCanvas, params) {
    this.fxBuffer.shader(this.paperShader);

    this.paperShader.setUniform('tex0', sourceCanvas);
    this.paperShader.setUniform('u_resolution', [this.width, this.height]);
    this.paperShader.setUniform('u_grain_amount', params.grain);
    this.paperShader.setUniform('u_vignette_amount', params.vignette);
    this.paperShader.setUniform('u_bleed_offset', params.bleed);
    this.paperShader.setUniform('u_texture_amount', params.tex);
    this.paperShader.setUniform('u_grit_amount', params.grit);

    if (this.customImageMap) {
      this.paperShader.setUniform('u_has_image_tex', true);
      this.paperShader.setUniform('u_image_tex', this.customImageMap);
      this.paperShader.setUniform('u_img_tex_amount', params.imgTex);
      this.paperShader.setUniform('u_img_tex_scale', params.imgScale);
    } else {
      this.paperShader.setUniform('u_has_image_tex', false);
    }

    this.fxBuffer.rect(0, 0, this.width, this.height);
    return this.fxBuffer;
  }
}

export default p5Paper;
