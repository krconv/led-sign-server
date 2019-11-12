import { Router } from "express";

import * as auth from "./auth";
import Engine from "./engine";
import { IFrame, WIDTH, HEIGHT, IColor } from "./plugins";

const routes = Router();

routes.use(auth.authenticate);

function serializeFrame(frame: IFrame): string {
  var serialized = "";
  serialized += [WIDTH, HEIGHT].join(",");

  serialized += "|";

  const serializedPixels = frame.rows.flatMap(row =>
    row.pixels.map(serializeColor)
  );
  serialized += serializedPixels.join(",");

  return serialized;
}

function serializeColor(color: IColor | null): string {
  var serialized = "";
  if (color) {
    [color.r, color.g, color.b].forEach(component => {
      serialized += Math.trunc(component)
        .toString(16)
        .padStart(2, "0");
    });
  } else {
    serialized = "000000";
  }
  return serialized;
}

routes.get("/render", (req, res) => {
  const sendFrame = (frame: IFrame) => {
    res.write(serializeFrame(frame) + "\n");
  };

  const engine = new Engine();
  engine.play(sendFrame);
});

export default routes;
