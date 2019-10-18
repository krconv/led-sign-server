import { IRegistrar, IFrame, Plugin, getPlugins } from "./plugins";
import { PluginType } from "./plugins/base";

const enabledPlugins = ["rainbow", "test"];

export default class Engine implements IRegistrar {
  plugins: Plugin[];
  backgroundScheduler: BackgroundScheduler;
  notificationScheduler: NotificationScheduler;
  constructor() {
    this.plugins = getPlugins(enabledPlugins);
    this.plugins.forEach(plugin => plugin.onRegister(this));
    this.backgroundScheduler = new BackgroundScheduler(this.plugins);
    this.notificationScheduler = new NotificationScheduler();
  }

  request(plugin: Plugin): void {
    if (plugin.getType() === PluginType.NOTIFICATION) {
      this.notificationScheduler.request(plugin);
    } else {
      throw new Error("Cannot request to play background plugins.")
    }
  }

  play(callback: (frame: IFrame) => void) {
    const render = () => {
      const [backgroundPlugin, backgroundPercent] = this.backgroundScheduler.schedule();
      const frame = backgroundPlugin.render(backgroundPercent);

      const [notificationPlugin, notificationPercent] = this.notificationScheduler.schedule();
      if (notificationPlugin && notificationPercent) {
        const notificationFrame = notificationPlugin.render(notificationPercent);
        notificationFrame.rows.forEach((row, y) => row.pixels.forEach((color, x) => {
          if (color) {
            frame.rows[y].pixels[x] = color;
          }
        }));
      }

      callback(frame);

      setTimeout(render, 100);
    };

    setImmediate(render);
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
    return (Date.now() - this.lastChange) / this.getActivePlugin().metadata.duration;
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
    return (Date.now() - this.lastChange) / this.getActivePlugin().metadata.duration;
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
