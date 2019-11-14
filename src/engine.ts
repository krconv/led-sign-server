import { IRegistrar, IFrame, Plugin, getPlugins } from "./plugins";
import { PluginType, initFrame, IPixel } from "./plugins/base";

const enabledPlugins = ["clock", "calendar", "weather"];

export default class Engine implements IRegistrar {
  plugins: Plugin[];
  backgroundScheduler: BackgroundScheduler;
  dataPixelScheduler: DataPixelScheduler;
  notificationScheduler: NotificationScheduler;

  constructor() {
    this.plugins = getPlugins(enabledPlugins);
    this.plugins.forEach(plugin => plugin.onRegister(this));
    this.backgroundScheduler = new BackgroundScheduler(this.plugins);
    this.dataPixelScheduler = new DataPixelScheduler(this.plugins);
    this.notificationScheduler = new NotificationScheduler();
  }

  request(plugin: Plugin): void {
    if (plugin.getType() === PluginType.NOTIFICATION) {
      this.notificationScheduler.request(plugin);
    } else {
      throw new Error(`Cannot request to play ${plugin.getType()} plugins.`);
    }
  }

  play(callback: (frame: IFrame) => void) {
    const render = () => {
      const painter = new FramePainter();

      const [
        backgroundPlugin,
        backgroundPercent
      ] = this.backgroundScheduler.schedule();
      painter.paint(backgroundPlugin.render(backgroundPercent));

      const dataPixelSchedules = this.dataPixelScheduler.schedule();
      dataPixelSchedules.forEach(([plugin, percent]) =>
        painter.paint(plugin.render(percent))
      );

      const [
        notificationPlugin,
        notificationPercent
      ] = this.notificationScheduler.schedule();
      if (notificationPlugin && notificationPercent) {
        painter.paint(notificationPlugin.render(notificationPercent));
      }

      callback(painter.getFrame());
      setTimeout(render, 100);
    };

    setImmediate(render);
  }

  getDataPixelPlugins(): Plugin[] {
    return this.plugins.filter(p => p.getType() == PluginType.DATA_PIXEL);
  }
}

class NotificationScheduler {
  queue: Plugin[];
  lastChange: number;

  constructor() {
    this.queue = [];
    this.lastChange = Date.now();
  }

  request(plugin: Plugin) {
    if (this.queue.length === 0) {
      this.lastChange = Date.now();
    }
    this.queue.push(plugin);
  }

  schedule(): [Plugin | null, number | null] {
    if (this.queue.length === 0) return [null, null];

    const percent = this.getPercent();

    if (percent > 1) {
      this.moveToNextPlugin();
      return this.schedule();
    } else {
      return [this.getActivePlugin(), percent];
    }
  }

  private getPercent(): number {
    return (
      (Date.now() - this.lastChange) / this.getActivePlugin().metadata.duration
    );
  }

  private getActivePlugin(): Plugin {
    return this.queue[0];
  }

  private moveToNextPlugin() {
    this.queue.shift();
    this.lastChange = Date.now();
  }
}

class BackgroundScheduler {
  queue: Plugin[];
  lastChange: number;

  constructor(plugins: Plugin[]) {
    this.queue = plugins.filter(
      plugin => plugin.getType() === PluginType.BACKGROUND
    );
    this.lastChange = Date.now();
  }

  schedule(): [Plugin, number] {
    const percent = this.getPercent();

    if (percent > 1) {
      this.moveToNextPlugin();
      return this.schedule();
    } else {
      return [this.getActivePlugin(), percent];
    }
  }

  private getPercent(): number {
    return (
      (Date.now() - this.lastChange) / this.getActivePlugin().metadata.duration
    );
  }

  private getActivePlugin(): Plugin {
    return this.queue[0];
  }

  private moveToNextPlugin() {
    const oldPlugin = this.queue.shift();
    if (oldPlugin) {
      this.queue.push(oldPlugin);
      this.lastChange = Date.now();
    } else {
      throw new Error("There are no background plugins to schedule!");
    }
  }
}

class DataPixelScheduler {
  plugins: Plugin[];

  constructor(plugins: Plugin[]) {
    this.plugins = plugins.filter(
      plugin => plugin.getType() === PluginType.DATA_PIXEL
    );
  }

  schedule(): [Plugin, number][] {
    const now = Date.now();
    return this.plugins.map(plugin => [
      plugin,
      this.getPercent(now, plugin.metadata.duration)
    ]);
  }

  private getPercent(now: number, duration: number): number {
    return (now / duration) % 1;
  }
}

const BLACK = { r: 0, g: 0, b: 0 };
class FramePainter {
  base: IFrame;

  constructor() {
    this.base = initFrame(BLACK);
  }

  paint(data: IFrame | IPixel | null): void {
    if (!data) {
      return;
    }

    if ("rows" in data) {
      this.paintFrame(data);
    } else {
      this.paintPixel(data);
    }
  }

  paintFrame(frame: IFrame): void {
    frame.rows.forEach((row, y) =>
      row.pixels.forEach(
        (color, x) => color && this.paintPixel({ color, x, y })
      )
    );
  }

  paintPixel({ x, y, color }: IPixel): void {
    this.base.rows[y].pixels[x] = color;
  }

  getFrame() {
    return this.base;
  }
}
