import {RD} from "./RD.js";

const default_GRID = {
  SIM_W: 400,
  SIM_H: 400,
  ACTUAL_W: 800,
  ACTUAL_H:800
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

new p5(RD(default_GRID, sampleSimulationParameters),"RDFrame");
