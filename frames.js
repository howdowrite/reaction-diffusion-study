import {RD} from "./RD.js";
import {shader_RD} from "./shader_RD.js";
import {pop_graph} from "./pop_graph.js";

const default_GRID = {
  SIM_W: 100.00,
  SIM_H: 100.00,
  ACTUAL_W: 800.00,
  ACTUAL_H:800.00
}

const LARGE = {
  SIM_W: 280.00,
  SIM_H: 280.00,
  ACTUAL_W: 800.00,
  ACTUAL_H: 800.00
}

const _1024 = {
  SIM_W: 256.00,
  SIM_H: 280.00,
  ACTUAL_W: 1024.00,
  ACTUAL_H: 1024.00
}

const SIM = {
  MAX_FRAMES : 1000,
  SKIPS : 2,
  CALCULATION_ITERATION : 8
}

const SEED = {
  GRID: []
}

const default_SIM_PARAM = {
  dA : 1.0,
  dB : 0.5,
  feedRate: 0.059,
  killRate: 0.062,
}

const cheetah = {
  dA : 0.9,
  dB : 0.3,
  feedRate: 0.029,
  killRate: 0.065,
}

const sampleSimulationParameters = {
  dA : 1.0,
  dB : 0.5,
  feedRate: 0.059,
  killRate: 0.062,
}

// const originalGetContext = HTMLCanvasElement.prototype.getContext;
// HTMLCanvasElement.prototype.getContext = function(type, attributes) {
//   if (type === '2d') {
//     attributes = attributes || {};
//     attributes.willReadFrequently = true; // Secretly injects the setting
//   }
//   return originalGetContext.call(this, type, attributes);
// };

const RD1 = new p5(shader_RD(LARGE, cheetah),"RDFrame");
const graph = new p5(pop_graph(()=>RD1.getChemATotal(), ()=>RD1.getChemBTotal()),"RDFrame");
// const graph = setInterval(()=>{
//   console.log(~~RD1.getChemATotal(), ~~RD1.getChemBTotal());
//   if(RD1.hasStopped()) {
//     clearInterval(graph);
//     console.log("~~Simulaton has stopped~~");
//     return;
//   }
// }, 1000);
// new p5(shader_RD(LARGE, sampleSimulationParameters),"SHADER_RDFrame");
