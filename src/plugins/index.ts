import { Plugin } from "./base";
import ClockPlugin from "./clock";
import TestPlugin from "./test";

const PLUGINS: Record<string, Plugin> = {
  test: new TestPlugin(),
  clock: new ClockPlugin(),
};

export function getPlugins(names: string[]): Plugin[] {
  return names.map(name => {
    const plugin = PLUGINS[name];
    plugin.onLoad();
    return plugin;
  });
}

export { IColor, IRegistrar, IFrame, Plugin, WIDTH, HEIGHT } from "./base";
