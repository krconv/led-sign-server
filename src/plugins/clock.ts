import { IFrame, initFrame, Plugin, HEIGHT, WIDTH, PluginType } from "./base";

const DURATION = 15000;
const FOREGROUND = { r: 0xff, g: 0xa5, b: 0x00 };
const BACKGROUND = { r: 0x00, g: 0x80, b: 0xbd };

export default class ClockPlugin extends Plugin {
  constructor() {
    super({ type: PluginType.BACKGROUND, duration: DURATION });
  }

  render(): IFrame {
    const frame = initFrame(BACKGROUND);
    const now = new Date();

    this.renderHour(frame, now);
    this.renderMinute(frame, now);

    return frame;
  }

  renderHour(frame: IFrame, now: Date) {
    var hour = (now.getHours() + 24) % 12 || 12;
    this.renderNumber(frame, 0, hour);
  }

  renderMinute(frame: IFrame, now: Date) {
    var minute = now.getMinutes();
    this.renderNumber(frame, 5, Math.trunc(minute / 10));
    this.renderNumber(frame, 7, minute % 10);
  }

  renderNumber(frame: IFrame, col: number, num: number) {
    var left = num;
    for (var x = col; x < WIDTH && left; x++) {
      for (var y = 0; y < HEIGHT && left; y++) {
        frame.rows[y].pixels[x] = FOREGROUND;
        left--;
      }
    }
  }
}
