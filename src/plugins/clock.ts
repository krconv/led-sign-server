import { IColor, IFrame, Plugin,  HEIGHT, WIDTH, PluginType } from "./base";

const DURATION = 15000;
const FOREGROUND = { r: 0xFF, g: 0xA5, b: 0x00 };
const BACKGROUND = { r: 0x00, g: 0xA4, b: 0xBD };

export default class ClockPlugin extends Plugin {
  constructor() {
    super({ type: PluginType.BACKGROUND, duration: DURATION});
  }

  render(): IFrame {
    const frame = this.initFrame();
    const now = new Date();

    this.renderHour(frame, now);
    this.renderMinute(frame, now)


    return frame;
  }

  initFrame(): IFrame {
    const rows = [];
    for (var y = 0; y < HEIGHT; y++) {
      const pixels = [];
      for (var x = 0; x < WIDTH; x++) {
        pixels.push(BACKGROUND);
      }
      rows.push({ pixels } );
    }

    return { rows }
  }

  renderHour(frame: IFrame, now: Date) {
    var hour = (now.getHours() + 24) % 12 || 12;
    this.renderNumber(frame, 0, hour);
  }

  renderMinute(frame: IFrame, now: Date) {
    var minute = now.getMinutes();
    this.renderNumber(frame, 4, Math.trunc(minute / 10));
    this.renderNumber(frame, 7, minute % 10);
  }

  renderNumber(frame: IFrame, col: number, num: number) {
    console.log(num)
    var left = num;
    for (var x = col; x < WIDTH && left; x++) {
      for (var y = 0; y < HEIGHT && left; y++) {
        frame.rows[y].pixels[x] = FOREGROUND;
        left--;
      }
    }
  }
}
