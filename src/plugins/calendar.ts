import { IColor, Plugin, IPixel, PluginType } from "./base";

const DURATION = 5000;

export default class CalendarPlugin extends Plugin {
  color: IColor;

  constructor() {
    super({ type: PluginType.DATA_PIXEL, duration: DURATION });
    this.color = this.randomColor();
  }

  onLoad() {
    setInterval(() => {
      this.color = this.randomColor();
    }, 5000);
  }

  render(percent: number): IPixel {
    return {
      color: this.color,
      x: 3,
      y: 4
    };
  }

  randomColor(): IColor {
    return {
      r: Math.round(Math.random() * 255),
      g: Math.round(Math.random() * 255),
      b: Math.round(Math.random() * 255)
    };
  }
}
