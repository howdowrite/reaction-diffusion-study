// const sampleSimulationParameters = {
//   dA : 0,
//   dB : 0,
//   feedRate: 0,
//   kilRate: 0,
// }
// ^ should be routed with the UI being used

//@ts-ignore
export const shader_RD = (GRID, PARAM) => s => {

  let totalChemA = 0, totalChemB = 0, diffA = 0, diffB = 0;
  const MAX_SIM_FRAMES = 1800;
  let rdShader;
  let bufferA, bufferB;
  let textLayer;
  let texelX, texelY;
  let frameRate = 0;
  let simulationSpeed = 0;
  let renderSpeed = 0;

  s.hasStopped = () => (s.frameCount >= MAX_SIM_FRAMES);
  s.getChemATotal = () => totalChemA;
  s.getChemBTotal = () => totalChemB;

  s.preload = () =>{
    rdShader = s.loadShader('./shader.vert','./shader.frag');
  }

  function seed(){
    s.background(255, 0, 0);// fill the world;
    s.noStroke();

    s.fill(0, 255, 0);       

    s.rectMode(s.CORNER); 
    s.rect(-20, -20, 30, 30); // WebGL (0,0) is dead center

    // s.fill(255, 0, 0);       
    // s.circle(0, 0, 110); // WebGL (0,0) is dead center

  }

  s.setup = () => {
    console.log(GRID);
    s.setAttributes({
      premultipliedAlpha: false, // STOPS WebGL from multiplying RGB by Alpha
      alpha: true,
      antialias: false,
      preserveDrawingBuffer: true
    });

    let webgl = s.createCanvas(GRID.ACTUAL_W, GRID.ACTUAL_H, s.WEBGL); 

    textLayer = s.createGraphics(GRID.ACTUAL_W, GRID.ACTUAL_H);
    s.pixelDensity(1);
    s.frameRate(60)
    frameRate = s.getFrameRate();

    texelX = 1.0 / GRID.SIM_W;
    texelY = 1.0 / GRID.SIM_H;


    bufferA = s.createFramebuffer({ width: GRID.SIM_W, height: GRID.SIM_H, format: s.FLOAT, textureFiltering: s.NEAREST, antialias:false});
    bufferB = s.createFramebuffer({ width: GRID.SIM_W, height: GRID.SIM_H, format: s.FLOAT, textureFiltering: s.NEAREST, antialias:false});

    // Grab the raw WebGL context from your p5 graphics buffer or canvas
    let gl = bufferA.gl;
    console.log(gl)
    // gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);


    bufferA.pixelDensity(1);
    bufferB.pixelDensity(1);

    bufferA.begin();
    seed();
    bufferA.end();

    // Seed Buffer B with the identical pattern so time T and T+1 match
    bufferB.begin();
    seed()
    bufferB.end();

};


  s.draw = () => {
    let s0 = performance.now();

    if(!(s.frameCount >= MAX_SIM_FRAMES))
    for(let calc = 0; calc<24;calc++){
      bufferA.begin()
      s.shader(rdShader);
      rdShader.setUniform('uTexelSize', [texelX, texelY]);
      rdShader.setUniform('uTexture', bufferB);
      rdShader.setUniform('uResolution', [GRID.SIM_W, GRID.SIM_H]);
      rdShader.setUniform('dA', PARAM.dA);
      rdShader.setUniform('dB', PARAM.dB);
      rdShader.setUniform('kill', PARAM.killRate);
      rdShader.setUniform('feed', PARAM.feedRate);

      s.rect(-GRID.SIM_W/2, -GRID.SIM_H/2, GRID.SIM_W, GRID.SIM_H);
      bufferA.end();

      // [bufferA, bufferB] = [bufferB, bufferA];
      let temp = bufferA;
      bufferA = bufferB;
      bufferB = temp;
      s.resetShader();
    }
    let s1 = performance.now();
    simulationSpeed = (simulationSpeed * 0.95) + (s1-s0) * 0.05;

    if(s.frameCount % 2 === 0 ){
      let r0 = performance.now();

      if(!(s.frameCount >= MAX_SIM_FRAMES))
      if(s.frameCount % 15 === 0){
        bufferB.loadPixels();
        diffA = totalChemA;
        diffB = totalChemB;
        totalChemA = totalChemB = 0

        for(let i = 0; i < bufferB.pixels.length;  i+=4){
          totalChemA += bufferB.pixels[i];
          totalChemB += bufferB.pixels[i+1];
        }

        diffA = (totalChemA - diffA);
        diffB = (totalChemB - diffB);

        // diffA = s.abs(diffA) <= 1.0 ? 0: diffA;
        // diffB = s.abs(diffB) <= 1.0 ? 0: diffB;
        //
      }


      const final = bufferB;
      let r1 = performance.now();
      renderSpeed = (renderSpeed * 0.95) + (r1-r0) * 0.05;

      frameRate = (frameRate * 0.95) + (s.getFrameRate() * 0.05);

      textLayer.clear();
      textLayer.textFont();
      textLayer.textSize(GRID.ACTUAL_H * 0.05);
      textLayer.fill(0)
      textLayer.text(`Frame Rate: ${frameRate.toFixed(2)}`,  12, GRID.ACTUAL_H * 0.05 );
      textLayer.text(`Live: ${(s.frameCount >= MAX_SIM_FRAMES)?`No`:'Yes'}`, 12, (GRID.ACTUAL_H * 0.05)*2);
      textLayer.text(`SIM: ${simulationSpeed.toFixed(2)} ms`, 12, (GRID.ACTUAL_H * 0.05)*3);
      textLayer.text(`RENDER: ${renderSpeed.toFixed(2)} ms`, 12, (GRID.ACTUAL_H * 0.05)*4);
      textLayer.text(`A Population: ${totalChemA.toFixed(2)} ${diffA.toFixed(2)}`, 12, (GRID.ACTUAL_H * 0.05)*5);
      textLayer.text(`B Population: ${totalChemB.toFixed(2)} ${diffB.toFixed(2)}`, 12, (GRID.ACTUAL_H * 0.05)*6);
      s.background(0);

      s.image(final, -GRID.ACTUAL_W/2, -GRID.ACTUAL_H/2, GRID.ACTUAL_W, GRID.ACTUAL_H);
      s.image(textLayer, -GRID.ACTUAL_W/2, -GRID.ACTUAL_H/2, GRID.ACTUAL_W, GRID.ACTUAL_H);
    }

  }
}
