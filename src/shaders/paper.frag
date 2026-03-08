precision highp float;

varying vec2 vTexCoord;
uniform sampler2D tex0;         
uniform vec2 u_resolution;      
uniform float u_grain_amount;   
uniform float u_vignette_amount;
uniform float u_bleed_offset;   
uniform float u_texture_amount; 
uniform float u_grit_amount;    

// Custom Image Texture Uniforms
uniform sampler2D u_image_tex;
uniform bool u_has_image_tex;
uniform float u_img_tex_amount;
uniform float u_img_tex_scale;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix( mix( random( i + vec2(0.0,0.0) ), 
                     random( i + vec2(1.0,0.0) ), u.x),
                mix( random( i + vec2(0.0,1.0) ), 
                     random( i + vec2(1.0,1.0) ), u.x), u.y);
}

float paperTexture(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 3; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec2 uv = vTexCoord;
    uv.y = 1.0 - uv.y;
    
    // 1. COLOR BLEED
    float r = texture2D(tex0, vec2(uv.x - u_bleed_offset, uv.y)).r;
    float g = texture2D(tex0, uv).g;
    float b = texture2D(tex0, vec2(uv.x + u_bleed_offset, uv.y)).b;
    float a = texture2D(tex0, uv).a; 
    vec4 color = vec4(r, g, b, a);
    
    // 2. CUSTOM IMAGE TEXTURE (Seamless)
    if (u_has_image_tex) {
        // Use fract() to make the image tile endlessly
        vec2 tileUV = fract(uv * u_img_tex_scale);
        
        // Sample the uploaded texture
        vec4 imgColor = texture2D(u_image_tex, tileUV);
        
        // Assuming it's a black/white height map: Black = deep grooves, White = flat paper.
        // We subtract the darkness from the main canvas color.
        float darkness = 1.0 - imgColor.r; 
        color.rgb -= (darkness * u_img_tex_amount);
    }

    // 3. PROCEDURAL GROOVES
    vec2 texScale = uv * 400.0; 
    float bumps = paperTexture(texScale);
    color.rgb -= (bumps * u_texture_amount);

    // 4. GRITTINESS & BLEMISHES
    float speckNoise = random(uv * u_resolution * 0.7); 
    float specks = smoothstep(0.995 - (u_grit_amount * 0.015), 1.0, speckNoise);
    float dirtNoise = noise(uv * 15.0); 
    float dirt = smoothstep(0.7 - (u_grit_amount * 0.2), 1.0, dirtNoise) * 0.15;
    color.rgb -= (specks * 0.6) + (dirt * u_grit_amount);

    // 5. MICRO PAPER GRAIN
    float microNoise = random(uv * u_resolution);
    color.rgb -= (microNoise * u_grain_amount);
    
    // 6. VIGNETTE
    float dist = distance(uv, vec2(0.5, 0.5));
    float vignette = smoothstep(0.9, 0.9 - u_vignette_amount, dist);
    color.rgb *= vignette;
    
    gl_FragColor = color;
}
