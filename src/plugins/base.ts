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

export const YELLOW: IColor = { r: 0xf5, g: 0xc2, b: 0x6b };
export const RED: IColor = { r: 0xf2, g: 0x54, b: 0x5b };
export const ORANGE: IColor = { r: 0xff, g: 0x8f, b: 0x59 };
export const BLUE: IColor = { r: 0x00, g: 0xa4, b: 0xbd };
export const LIGHT_GRAY: IColor = { r: 0xcb, g: 0xd6, b: 0xe2 };
export const WHITE: IColor = { r: 0xff, g: 0xff, b: 0xff };
export const BLUSH: IColor = { r: 0xbc, g: 0x48, b: 0x73 };
export const MIDNIGHT: IColor = { r: 0x00, g: 0x3f, b: 0x5c };
