import bodyParser from "body-parser";
import express from "express";
import compression from "compression";
import helmet from "helmet";
import cors from "cors";

import * as auth from "./auth";
import routes from "./routes";

const PORT = process.env.PORT || 8080;

const SECRET_TOKEN = process.env.SECRET_TOKEN || "secret";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(auth.initialize(SECRET_TOKEN));

app.use(helmet());
app.use(compression());

app.use("/api", routes);

console.log(`Server listening on http://localhost:${PORT}`);
app.listen(PORT);
