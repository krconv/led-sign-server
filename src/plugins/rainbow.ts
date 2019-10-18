import { IColor, IFrame, Plugin,  HEIGHT, WIDTH, PluginType } from "./base";

const DURATION = 15000;

export default class RainbowPlugin extends Plugin {
  constructor() {
    super({ type: PluginType.BACKGROUND, duration: DURATION});
  }

  render(percent: number): IFrame {
    const rows = [];
    const color = this.generateColorWheel(percent);
    for (var y = 0; y < HEIGHT; y++) {
      const pixels = [];
      for (var x = 0; x < WIDTH; x++) {
        pixels.push(color);
      }
      rows.push({ pixels } );
    }

    return { rows }
  }

  generateColorWheel(percent: number): IColor {
    const base = percent * 6;

    return {
      r: Math.max(1 - Math.abs(base - 1), 0) * 255,
      g: Math.max(1 - Math.abs(base - 3), 0) * 255,
      b: Math.max(1 - Math.abs(base - 5), 0) * 255,
    }
  }
}
