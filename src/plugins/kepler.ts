import {
  IColor,
  Plugin,
  IFrame,
  PluginType,
  RED,
  WIDTH,
  HEIGHT,
} from "./base";
import { WebClient } from "@slack/web-api";

const DURATION = 5000;
const ON_PERCENT = 0.2;
const REFRESH_INTERVAL = 5 * 1000;

export default class KeplerPlugin extends Plugin {
  alerts?: KeplerAlert[] | null;
  slack?: WebClient;

  constructor() {
    super({ type: PluginType.DATA_PIXEL, duration: DURATION });
  }

  onLoad() {
    this.slack = new WebClient(process.env.SLACK_TOKEN);
    this.updateAlerts();
    setInterval(() => this.updateAlerts(), REFRESH_INTERVAL);
  }

  updateAlerts(): Promise<KeplerAlert[] | null> {
    return this.getCurrentAlerts().then(
      alerts => (this.alerts = alerts)
    );
  }

  getCurrentAlerts(): Promise<KeplerAlert[]> {
    if (!this.slack) return Promise.reject("Slack client isn't connected");

    return this.slack.channels.history({ channel: process.env.SLACK_CHANNEL || "" })
      .then(response => {
        const messages: any[] = response.messages as any;
        const alerts: KeplerAlert[] = messages
          .map(message => message.text)
          .map(text => KeplerAlert.fromMessage(text))
          .filter(alert => alert != null) as any;
        return alerts;
      })
  }

  render(percent: number): IFrame | null {
    const color = this.determineColor(percent);
    if (!color) return null;

    return this.createOutlineFrame(color);
  }

  determineColor(percent: number): IColor | null {
    if (!this.alerts || this.alerts.length === 0) {
      return null;
    }

    if (percent < ON_PERCENT) {
      return RED;
    } else {
      return null;
    }
  }

  createOutlineFrame(color: IColor) {
    const rows = [];
    for (let y = 0; y < HEIGHT; y++) {
      const row = [];
      const isFirstOrLastRow = y === 0 || y + 1 === HEIGHT;
      for (let x = 0; x < WIDTH; x++) {
        const isFirstOrLastColumn = x === 0 || x + 1 === WIDTH;
        if (isFirstOrLastRow || isFirstOrLastColumn) {
          row.push(color);
        } else {
          row.push(null);
        }
      }
      rows.push({ pixels: row });
    }

    return { rows };
  }
}

const ALERT_PATTERN = /^\*(prod|qa)\/[a-z0-9-]+\[(high|low) priority\]\: ([a-zA-Z-]+)\* alerting .*:red-check:.*$/;
const ALERT_GROUPS = { "environment": 1, "priority": 2, "deployable": 3}

const DOT_MATCHES_NEWLINE = "s";
const ALERT_REGEX = new RegExp(ALERT_PATTERN, DOT_MATCHES_NEWLINE);

class KeplerAlert {
  environment: string;
  priority: string;
  deployable: string;

  constructor(environment: string, priority: string, deployable: string) {
    this.environment = environment;
    this.priority = priority;
    this.deployable = deployable;
  }

  static fromMessage(message: string): KeplerAlert | null {
    const match = ALERT_REGEX.exec(message);
    if (!match) return null;

    return new KeplerAlert(
      match[ALERT_GROUPS["environment"]],
      match[ALERT_GROUPS["priority"]],
      match[ALERT_GROUPS["deployable"]]
    );
  }
}
