import {
  IColor,
  Plugin,
  IPixel,
  PluginType,
  RED,
  BLUE,
  YELLOW,
  LIGHT_GRAY,
  WHITE
} from "./base";
import request from "request";

const DURATION = 1000;
const REFRESH_INTERVAL = 10 * 60 * 1000;

enum Condition {
  Ash,
  Clear,
  Clouds,
  Drizzle,
  Dust,
  Fog,
  Haze,
  Mist,
  Rain,
  Sand,
  Smoke,
  Snow,
  Squall,
  Tornado,
  Thunderstorm
}

export default class WeatherPlugin extends Plugin {
  conditions?: Condition | null;

  constructor() {
    super({ type: PluginType.DATA_PIXEL, duration: DURATION });
  }

  onLoad() {
    this.updateConditions();
    setInterval(() => this.updateConditions(), REFRESH_INTERVAL);
  }

  render(percent: number): IPixel | null {
    var color = this.calculateColor();
    return color && { color, x: 3, y: 4 };
  }

  updateConditions(): Promise<Condition | null> {
    return this.getCurrentConditions().then(
      conditions => (this.conditions = conditions)
    );
  }

  getCurrentConditions(): Promise<Condition | null> {
    return new Promise((resolve, reject) =>
      request(
        { url: this.buildApiUrl(), json: true },
        (err, response, body) => {
          if (err) {
            reject(err);
          }

          resolve(this.getConditionFromResponse(body));
        }
      )
    );
  }

  buildApiUrl(): string {
    const cityId = process.env.WEATHER_API_CITY_ID;
    const appId = process.env.WEATHER_API_APP_ID;
    return `https://samples.openweathermap.org/data/2.5/weather?id=${cityId}&appid=${appId}`;
  }

  getConditionFromResponse(response: any): Condition | null {
    const weather = (response.weather || [null])[0];
    if (!weather) {
      return null;
    }
    const condition: keyof typeof Condition = weather.main;
    return Condition[condition];
  }

  calculateColor(): IColor | null {
    switch (this.conditions) {
      case Condition.Ash:
        return RED;
      case Condition.Clear:
        return YELLOW;
      case Condition.Clouds:
        return LIGHT_GRAY;
      case Condition.Drizzle:
        return BLUE;
      case Condition.Dust:
        return RED;
      case Condition.Fog:
        return LIGHT_GRAY;
      case Condition.Haze:
        return LIGHT_GRAY;
      case Condition.Mist:
        return LIGHT_GRAY;
      case Condition.Rain:
        return BLUE;
      case Condition.Sand:
        return RED;
      case Condition.Smoke:
        return RED;
      case Condition.Snow:
        return WHITE;
      case Condition.Squall:
        return WHITE;
      case Condition.Tornado:
        return RED;
      case Condition.Thunderstorm:
        return BLUE;
      default:
        return null;
    }
  }
}
