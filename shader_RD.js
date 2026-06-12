// const sampleSimulationParameters = {
//   dA : 0,
//   dB : 0,
//   feedRate: 0,
//   kilRate: 0,
// }
// ^ should be routed with the UI being used

//@ts-ignore
export const shader_RD = (GRID, PARAM) => s => {

  let frames = 0;
  let totalChemA = 0, totalChemB = 0;
  const MAX_SIM_FRAMES = 800;
  let rdShader;
  let bufferA, bufferB;
  let textLayer;

  s.hasStopped = () => (frames >= MAX_SIM_FRAMES);
  s.getChemATotal = () => totalChemA;
  s.getChemBTotal = () => totalChemB;

  s.preload = () =>{
    rdShader = s.loadShader('./shader.vert','./shader.frag');
  }

  function seed(){
    s.background(255, 0, 0);// fill the world;
    s.noStroke();

    s.fill(0, 255, 0);       
    s.rect(-20, -20, 40, 40); // WebGL (0,0) is dead center

    // s.fill(255, 0, 0);       
    // s.circle(0, 0, 110); // WebGL (0,0) is dead center

  }

  s.setup = () => {
    console.log(GRID);
    s.createCanvas(GRID.ACTUAL_W, GRID.ACTUAL_H, s.WEBGL); 
    textLayer = s.createGraphics(GRID.ACTUAL_W, GRID.ACTUAL_H);
    s.pixelDensity(1);
    s.frameRate(60)



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
    frames++
    // if(s.frameCount % 8 !==0)
    if(!(frames >= MAX_SIM_FRAMES))
    for(let calc = 0; calc<40;calc++){
       bufferA.begin()
       s.shader(rdShader);

       rdShader.setUniform('uTexture', bufferB);
       rdShader.setUniform('uResolution', [GRID.SIM_W, GRID.SIM_H]);
       rdShader.setUniform('dA', PARAM.dA);
       rdShader.setUniform('dB', PARAM.dB);
       rdShader.setUniform('kill', PARAM.killRate);
       rdShader.setUniform('feed', PARAM.feedRate);

       s.rect(-GRID.SIM_W/2, -GRID.SIM_H/2, GRID.SIM_W, GRID.SIM_H);
       bufferA.end();

       [bufferA, bufferB] = [bufferB, bufferA];
     }


    bufferB.loadPixels();
    totalChemA = totalChemB = 0
    for(let i = 0; i < bufferB.pixels.length;  i+=4){
      totalChemA += bufferB.pixels[i];
      totalChemB += bufferB.pixels[i+1];
    }
    // console.log(totalChemA , totalChemB);
    const final = bufferB;

    textLayer.clear();
    textLayer.textFont();
    textLayer.textSize(GRID.ACTUAL_H * 0.05);
    textLayer.fill(0)
    textLayer.text(`Frame Rate: ${s.getFrameRate()}`,  12, GRID.ACTUAL_H * 0.05 );
    textLayer.text(`Live: ${(frames >= MAX_SIM_FRAMES)?`No`:'Yes'}`, 12, (GRID.ACTUAL_H * 0.05)*2);
    s.background(0);

    s.image(final, -GRID.ACTUAL_W/2, -GRID.ACTUAL_H/2, GRID.ACTUAL_W, GRID.ACTUAL_H);
    s.image(textLayer, -GRID.ACTUAL_W/2, -GRID.ACTUAL_H/2, GRID.ACTUAL_W, GRID.ACTUAL_H);

  }
}
