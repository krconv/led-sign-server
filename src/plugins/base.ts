export const HEIGHT = 5;
export const WIDTH = 9;

export interface IFrame {
  rows: IFrameRow[];
}

interface IFrameRow {
  pixels: (IColor | null)[];
}

export const initFrame = (color: IColor | null): IFrame => {
  const rows = [];
  for (var y = 0; y < HEIGHT; y++) {
    const pixels = [];
    for (var x = 0; x < WIDTH; x++) {
      pixels.push(color);
    }
    rows.push({ pixels });
  }

  return { rows };
};

export interface IColor {
  r: number;
  g: number;
  b: number;
}

export interface IPixel {
  color: IColor;
  x: number;
  y: number;
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

  render(percent: number): IFrame | IPixel | null {
    return null;
  }
}

export enum PluginType {
  BACKGROUND,
  NOTIFICATION,
  DATA_PIXEL
}

export interface IPluginMetadata {
  type: PluginType;
  duration: number;
}

export interface IRegistrar {
  request(plugin: Plugin): void;
}
