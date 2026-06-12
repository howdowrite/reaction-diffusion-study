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
export const RD = (GRID, PARAM) => s => {


  //@ts-ignore
  let gridA, gridB, nextA, nextB, buffer;
  const MAX_SIM_FRAMES = 800;

  s.setup = () => {
    console.log(GRID);
    s.createCanvas(GRID.ACTUAL_W, GRID.ACTUAL_H);
    buffer = s.createGraphics(GRID.SIM_W, GRID.SIM_H);
    buffer.elt.getContext('2d')
    buffer.pixelDensity(1);

    gridA = new Float32Array(GRID.SIM_W * GRID.SIM_H);
    gridB = new Float32Array(GRID.SIM_W * GRID.SIM_H);
    nextA = new Float32Array(GRID.SIM_W * GRID.SIM_H);
    nextB = new Float32Array(GRID.SIM_W * GRID.SIM_H);

    gridA.fill(1.0);
    gridB.fill(0.0);
    nextA.fill(1.0);
    nextB.fill(0.0);

    //Seeding
    //determined by another buffer via input
    //It should happen here however
    //place holder for now
    //

      for(let h = GRID.SIM_H/2 - 20;               h< GRID.SIM_H/2 + 20; h++)
      for(let w = GRID.SIM_W/2 - 20; w< GRID.SIM_W/2 + 20;w++){
        const idx = w + (h*GRID.SIM_W);
        gridB[idx] = 1.0;
        // if(random(1) < .04) gridB[idx] = (1.0);
      }

  };

  s.draw = () => {

    if(!(frames++ >= MAX_SIM_FRAMES))
    for(let calc = 0; calc < 80; calc++){
      for(let y = 1; y < GRID.SIM_H - 1; y++){
        const row = y * GRID.SIM_W;
        for(let x = 1; x < GRID.SIM_W - 1; x++){
          const idx = x + row | 0;
          const a = gridA[idx];
          const b = gridB[idx];
          const feedTerm = PARAM.feedRate * (1-a);
          const killTerm = (PARAM.killRate + PARAM.feedRate) * b;

          const top = idx - GRID.SIM_W;
          const bottom = idx + GRID.SIM_W;

          const laplaceA =
            (gridA[idx] * -1) +
            ((gridA[top - 1] + gridA[top + 1] + gridA[bottom - 1] + gridA[bottom + 1]) * 0.05) +
            ((gridA[top] + gridA[bottom] + gridA[idx - 1] + gridA[idx+1]) * 0.2);

          const laplaceB =
            (gridB[idx] * -1) +
            ((gridB[top - 1] + gridB[top + 1] + gridB[bottom - 1] + gridB[bottom + 1]) * 0.05) +
            ((gridB[top] + gridB[bottom] + gridB[idx - 1] + gridB[idx+1]) * 0.2);

          const abb = a * b* b;
          const dt = 1;
          const newA = a + dt * ((PARAM.dA * laplaceA) - abb + feedTerm);
          const newB = b + dt * ((PARAM.dB * laplaceB) + abb - killTerm);

          nextA[idx] = Math.min(1, Math.max(0,newA));
          nextB[idx] = Math.min(1, Math.max(0.0001,newB));
        }
      }
      [nextA,gridA] = [gridA, nextA];
      [nextB,gridB] = [gridB, nextB];
    }

    if(s.frameCount % 2 === 0){
      buffer.loadPixels();
      for(let y = 1; y<GRID.SIM_H-1; y++){
        const row = (y*GRID.SIM_W)
        for(let x = 1; x<GRID.SIM_W-1; x++){
          const idx = x + row | 0;
          const pix = idx * 4;
          const v = gridA[idx] ** 2.5
          buffer.pixels[pix + 0] = ~~(v*255);
          buffer.pixels[pix + 1] = ~~(v*255);
          buffer.pixels[pix + 2] = ~~(v*255);
          buffer.pixels[pix + 3] = 255;
      }
    }
      s.textSize(GRID.ACTUAL_H * 0.05);
      s.fill(0)
      buffer.updatePixels();
      s.image(buffer,0,0,GRID.ACTUAL_W,GRID.ACTUAL_H);
      s.text(`Live: ${(frames >= MAX_SIM_FRAMES)?`No`:'Yes'}`, 12, (GRID.ACTUAL_H * 0.05)*2);
      s.text(`Frame Rate: ${s.getFrameRate()}`,  12, GRID.ACTUAL_H * 0.05 );
    }
  }
}
