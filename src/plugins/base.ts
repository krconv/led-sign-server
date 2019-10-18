export const HEIGHT = 5;
export const WIDTH = 9;

export interface IFrame {
  rows: IFrameRow[];
}

interface IFrameRow {
  pixels: (IColor | null)[];
}

export interface IColor {
  r: number;
  g: number;
  b: number;
}

export abstract class Plugin {
  metadata: IPluginMetadata;
  registrar?: IRegistrar;
  constructor(metadata: IPluginMetadata) {
    this.metadata = metadata;
  }

  getType(): PluginType {
    return this.metadata.type;
  }

  onRegister(registrar: IRegistrar): void {
    this.registrar = registrar;
  }

  onLoad(): void {}

  abstract render(percent: number): IFrame;
}

export enum PluginType {
  BACKGROUND,
  NOTIFICATION
}

export interface IPluginMetadata {
  type: PluginType;
  duration: number;
}

export interface IRegistrar {
  request(plugin: Plugin): void;
}
