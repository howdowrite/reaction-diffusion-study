const default_GRID = {
  SIM_W: 200,
  SIM_H: 200,
  ACTUAL_W: 500,
  ACTUAL_H:500
}

// const sampleSimulationParameters = {
//   dA : 0,
//   dB : 0,
//   feedRate: 0,
//   kilRate: 0,
// }
// ^ should be routed with the UI being used

//@ts-ignore
export const shader_RD = (GRID, PARAM) => s => {

  let rdShader;
  let bufferA, bufferB;
  let isSwapped = false;

  s.preload = () =>{
    rdShader = s.loadShader('./shader.vert','./shader.frag');
  }

  function seed(){
    s.background(255, 0, 0);// fill the world;
    s.noStroke();

    s.fill(0, 255, 0);       
    s.rect(-20, -20, 20, 20); // WebGL (0,0) is dead center

    // s.fill(255, 0, 0);       
    // s.circle(0, 0, 110); // WebGL (0,0) is dead center

  }

  s.setup = () => {
    s.createCanvas(600, 600, s.WEBGL); 

    bufferA = s.createFramebuffer({ width: GRID.SIM_W, height: GRID.SIM_H, format: s.FLOAT, textureFiltering: s.NEAREST });
    bufferB = s.createFramebuffer({ width: GRID.SIM_W, height: GRID.SIM_H, format: s.FLOAT, textureFiltering: s.NEAREST });

    bufferA.begin();
    seed();
    bufferA.end();

    // Seed Buffer B with the identical pattern so time T and T+1 match
    bufferB.begin();
    seed()
    bufferB.end();

};


  s.draw = () => {
    for(let x = 0; x<8;x++){
      let reader = isSwapped ? bufferB : bufferA;
      let writer = isSwapped ? bufferA : bufferB;

      writer.begin();
      s.shader(rdShader);
      rdShader.setUniform('uResolution', [GRID.SIM_W, GRID.SIM_H]);
      rdShader.setUniform('dA', PARAM.dA);
      rdShader.setUniform('dB', PARAM.dB);
      rdShader.setUniform('kill', PARAM.killRate);
      rdShader.setUniform('feed', PARAM.feedRate);
      rdShader.setUniform('uTexture', reader);

      s.rect(-GRID.SIM_W/2, -GRID.SIM_H/2, GRID.SIM_W, GRID.SIM_H);
      writer.end();

      isSwapped = !isSwapped;
    }


    if(s.frameCount % 12 === 0){
      const final = isSwapped ? bufferB : bufferA;
      s.background(0)
      s.image(final, -GRID.ACTUAL_W/2, -GRID.ACTUAL_H/2, GRID.ACTUAL_W, GRID.ACTUAL_H);
    }
  }
}
