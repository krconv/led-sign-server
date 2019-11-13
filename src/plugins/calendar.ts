import { IColor, Plugin, IPixel, PluginType } from "./base";
import { OAuth2Client } from "google-auth-library";
import { calendar_v3 } from "googleapis";

const DURATION = 2000;
const BLINK_PERCENT = 0.5;
const REFRESH_INTERVAL = 60000;

export default class CalendarPlugin extends Plugin {
  authClient?: OAuth2Client;
  calendarClient?: calendar_v3.Calendar;
  nextEvent: calendar_v3.Schema$Event | null;

  constructor() {
    super({ type: PluginType.DATA_PIXEL, duration: DURATION });
    this.nextEvent = null;
  }

  onLoad() {
    this.authClient = new OAuth2Client({
      clientId: process.env.GOOGLE_API_CLIENT_ID,
      clientSecret: process.env.GOOGLE_API_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_API_REDIRECT_URI,
    });
    this.authClient.setCredentials({
      refresh_token: process.env.GOOGLE_API_REFRESH_TOKEN
    });
    this.calendarClient = new calendar_v3.Calendar({
      auth: this.authClient,
    });

    this.updateNextEvent();
    setInterval(() => this.updateNextEvent(), REFRESH_INTERVAL);
  }

  render(percent: number): IPixel | null {
    var color = this.calculateColor();

    if (this.shouldBlink()) {
      if (percent > BLINK_PERCENT) {
        color = null;
      }
    }

    return color && { color, x: 3, y: 4 };
  }

  updateNextEvent(): Promise<calendar_v3.Schema$Event> {
    return this.getNextNonAllDayEvent()
      .then(event => this.nextEvent = event)
  }

  getNextNonAllDayEvent(): Promise<calendar_v3.Schema$Event> {
    return new Promise((resolve, reject) => {
      if (!this.calendarClient) {
        reject("Calendar is not initialized!");
        return;
      }

      this.calendarClient.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      }, (err, res) => {
        if (err || !res) {
          reject("Calendar returned an error: " + err);
          return;
        }

        const eventsWithStartTime = (res.data.items || [])
          .filter(event => (event.start || {}).dateTime);

        if (!eventsWithStartTime || eventsWithStartTime.length === 0) {
          reject("Calendar didn't return a next event!");
          return;
        }

        resolve(eventsWithStartTime[0]);
      })
    })
  }

  calculateColor(): IColor | null {
    if (this.nextEventIsWithinOneMinute()) {
      return { r: 255, g: 0, b: 0 };
    } else if (this.nextEventIsWithinFiveMinutes()) {
      return { r: 255, g: 255, b: 0 };
    } else {
      return null;
    }
  }

  shouldBlink(): boolean {
    return !this.nextEventIsStarted();
  }

  nextEventIsWithinFiveMinutes() {
    return this.nextEventIsWithinMinutes(5);
  }

  nextEventIsWithinOneMinute() {
    return this.nextEventIsWithinMinutes(1);
  }

  nextEventIsStarted(): boolean {
    return this.nextEventIsWithinMinutes(0);
  }

  nextEventIsWithinMinutes(minutes: number): boolean {
    const startTime = this.getNextEventStartTime();
    if (startTime) {
      return startTime <= Date.now() + (minutes * 60 * 1000);
    } else {
      return false;
    }
  }

  getNextEventStartTime(): number | null {
    return Date.parse(((this.nextEvent || {}).start || {}).dateTime || "") || null;
  }
}
