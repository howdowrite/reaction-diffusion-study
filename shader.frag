precision highp float;
varying vec2 vTexCoord;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float feed;
uniform float kill;
uniform float dA;
uniform float dB;

void main() {
  vec2 st = vTexCoord;
  vec2 texel = 1.0 / uResolution; // The size of exactly one pixel

  if (

      vTexCoord.x <= texel.x ||
      vTexCoord.x >= 1.0 - texel.x ||
      vTexCoord.y <= texel.y ||
      vTexCoord.y >= 1.0 - texel.y
     ) {
    gl_FragColor = texture2D(uTexture, vTexCoord);
    return;
  }

  // 1. Sample the 9-pixel neighborhood (Center + 4 Cardinal Neighbors)
  vec4 c = texture2D(uTexture, st);
  vec4 n = texture2D(uTexture, st + vec2(0.0, -texel.y));
  vec4 s = texture2D(uTexture, st + vec2(0.0, texel.y));
  vec4 e = texture2D(uTexture, st + vec2(texel.x, 0.0));
  vec4 w = texture2D(uTexture, st + vec2(-texel.x, 0.0));

  vec4 ne = texture2D(uTexture, st + vec2( texel.x, -texel.y));
  vec4 nw = texture2D(uTexture, st + vec2(-texel.x, -texel.y));
  vec4 sw = texture2D(uTexture, st + vec2(-texel.x,  texel.y));
  vec4 se = texture2D(uTexture, st + vec2( texel.x,  texel.y));


  // 2. Laplacian Grid Matrix (Calculates chemical bleeding/diffusion)
  // Red Channel = Chemical A, Green Channel = Chemical B

  // vec2 lap = (n.rg + s.rg + e.rg + w.rg) * 1.0  + (c.rg * -4.0);

  vec2 neighbors = ((n.rg + e.rg + w.rg + s.rg) * 0.2) + ((ne.rg + nw.rg + se.rg + sw.rg) * 0.05);
  // binary floating-point numbers cannot perfectly represent 0.2 or 0.05

  vec2 lap = neighbors - c.rg;
  

  // 3. Gray-Scott Equation Formulas
  float reaction = c.r * c.g * c.g; // Amount of A consumed by B
  float dt = 1.0;
  float newA = c.r + dt * ((dA * lap.r) - reaction + (feed * (1.0 - c.r)));
  float newB = c.g + dt * ((dB * lap.g) + reaction - ((kill + feed) * c.g));

  // 4. Output values clamped to valid 0.0-1.0 ranges back into the texture channel
  gl_FragColor = vec4(clamp(newA, 0.0, 1.0), clamp(newB, 0.0001, 1.0), 0.0, 1.0);
}
