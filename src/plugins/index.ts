import { Plugin } from "./base";
import RainbowPlugin from "./rainbow";
import TestPlugin from "./test";

const PLUGINS: Record<string, Plugin> = {
  test: new TestPlugin(),
  rainbow: new RainbowPlugin(),
};

export function getPlugins(names: string[]): Plugin[] {
  return names.map(name => {
    const plugin = PLUGINS[name];
    plugin.onLoad();
    return plugin;
  });
}

export { IColor, IRegistrar, IFrame, Plugin, WIDTH, HEIGHT } from "./base";
