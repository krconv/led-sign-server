import { IColor, IFrame, Plugin, HEIGHT, WIDTH, PluginType } from "./base";

const DURATION = 2000;

export default class TestPlugin extends Plugin {
  constructor() {
    super({ type: PluginType.NOTIFICATION, duration: DURATION });
  }

  onLoad() {
    setInterval(() => {
      if (this.registrar) {
        this.registrar.request(this);
      }
    }, 5000)
  }

  render(percent: number): IFrame {
    const rows = [];
    const color = this.generateColor(percent);

    for (var y = 0; y < HEIGHT; y++) {
      const pixels = [];
      for (var x = 0; x < WIDTH; x++) {
        if (y === 0 && x === 0) {
          pixels.push(color);
        } else {
          pixels.push(null);
        }
      }
      rows.push({ pixels });
    }

    return { rows };
  }

  generateColor(percent: number): IColor {
    const base = percent * 2;
    return {
      r: 0,
      g: 0,
      b: Math.max(1 - Math.abs(base - 1), 0) * 255
    };
  }
}
