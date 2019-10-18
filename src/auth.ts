import passport from "passport";
import { Strategy as BearerStrategy } from "passport-http-bearer";

export const initialize = (secret: string) => {
  passport.use(
    "header-token",
    new BearerStrategy((token, done) => {
      if (token !== secret) {
        return done(null, null, "Incorrect credentials.");
      }

      return done(null, {});
    })
  );

  return passport.initialize();
};

export const authenticate = passport.authenticate("header-token", {
  session: false
});
