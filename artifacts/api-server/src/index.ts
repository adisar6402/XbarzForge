import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.resolve(process.cwd(), "../../.env"),
});

console.log("cwd:", process.cwd());
console.log("env exists:", process.env.DATABASE_URL ? "YES" : "NO");
console.log("database:", process.env.DATABASE_URL);

import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env.PORT ?? "8080";

const port = Number(rawPort);

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});