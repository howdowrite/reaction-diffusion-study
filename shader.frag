#version 300 es
precision highp float;
in vec2 vTexCoord;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float feed;
uniform float kill;
uniform float dA;
uniform float dB;
uniform vec2 uTexelSize;

// out vec4 fragColor;
layout(location = 0) out highp vec4 fragColor;

void main() {
  // vec2 st = vTexCoord;
  vec2 texel = uTexelSize; // The size of exactly one pixel

  ivec2 st = ivec2(floor(gl_FragCoord.xy));

  // 2. Set up boundary protection using pure integers
  ivec2 size = textureSize(uTexture, 0); // WebGL 2 can read texture size automatically!
  if (st.x <= 0 || st.x >= size.x - 1 || st.y <= 0 || st.y >= size.y - 1) {
    fragColor = texelFetch(uTexture, st, 0);
    return;
  }

  // if (
  //
  //     vTexCoord.x <= texel.x ||
  //     vTexCoord.x >= 1.0 - texel.x ||
  //     vTexCoord.y <= texel.y ||
  //     vTexCoord.y >= 1.0 - texel.y
  //    ) {
  //   fragColor = texture(uTexture, vTexCoord);
  //   return;
  // }
  //
  // 1. Sample the 9-pixel neighborhood (Center + 4 Cardinal Neighbors)
  vec2 c  = texelFetch(uTexture, st + ivec2( 0,  0), 0).rg;
  vec2 n  = texelFetch(uTexture, st + ivec2( 0,  1), 0).rg;
  vec2 s  = texelFetch(uTexture, st + ivec2( 0, -1), 0).rg;
  vec2 e  = texelFetch(uTexture, st + ivec2( 1,  0), 0).rg;
  vec2 w  = texelFetch(uTexture, st + ivec2(-1,  0), 0).rg;

  vec2 nw = texelFetch(uTexture, st + ivec2(-1,  1), 0).rg;
  vec2 ne = texelFetch(uTexture, st + ivec2( 1,  1), 0).rg;
  vec2 sw = texelFetch(uTexture, st + ivec2(-1, -1), 0).rg;
  vec2 se = texelFetch(uTexture, st + ivec2( 1, -1), 0).rg;


  // 2. Laplacian Grid Matrix (Calculates chemical bleeding/diffusion)
  // Red Channel = Chemical A, Green Channel = Chemical B

  // vec2 lap = (n.rg + s.rg + e.rg + w.rg) * 1.0  + (c.rg * -4.0);

  vec2 neighbors = ((n.rg + e.rg + w.rg + s.rg) * 4.0) + ((ne.rg + nw.rg + se.rg + sw.rg));
  // binary floating-point numbers cannot perfectly represent 0.2 or 0.05

  vec2 lap = (neighbors - (c * 20.0))/20.0;
  

  // 3. Gray-Scott Equation Formulas
  float reaction = c.r * c.g * c.g; // Amount of A consumed by B
  // reaction = floor(reaction * 4096.00)/4096.00;
  float dt = 1.0;
  float newA = c.r + dt * ((dA * lap.r) - reaction + (feed * (1.0 - c.r)));
  float newB = c.g + dt * ((dB * lap.g) + reaction - ((kill + feed) * c.g));

  // Denormalization Guard: If a value drops below 1e-6, force it to its floor limit 
  // This prevents the float registers from breaking over infinitely tiny numbers
  if (newA < 1e-6) newA = 0.0;
  if (newB < 0.0001) newB = 0.0001;

  newA = round(newA * 16384.00)/16384.00;
  newB = round(newB * 16384.00)/16384.00;

  // 4. Output values clamped to valid 0.0-1.0 ranges back into the texture channel
  fragColor = vec4(clamp(newA, 0.0, 1.0), clamp(newB, 0.0001, 1.0), 0.0, 1.0);
}
