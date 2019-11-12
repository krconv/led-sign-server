import { Plugin } from "./base";
import ClockPlugin from "./clock";
import TestPlugin from "./test";
import CalendarPlugin from "./calendar";

const PLUGINS: Record<string, Plugin> = {
  test: new TestPlugin(),
  clock: new ClockPlugin(),
  calendar: new CalendarPlugin()
};

export function getPlugins(names: string[]): Plugin[] {
  return names.map(name => {
    const plugin = PLUGINS[name];
    plugin.onLoad();
    return plugin;
  });
}

export {
  IColor,
  IRegistrar,
  IFrame,
  initFrame,
  IPixel,
  Plugin,
  WIDTH,
  HEIGHT
} from "./base";
