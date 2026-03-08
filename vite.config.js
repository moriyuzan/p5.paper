import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [
    glsl({
      include: /\.(glsl|wgsl|vert|frag)$/i
    })
  ],
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'p5Paper',
      formats: ['es', 'umd'],
      fileName: (format) => `p5.paper.${format}.js`
    }
  }
});
