import { createServer } from "node:http";
import { createApp } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { ioManager } from "./socket/io.js";

async function start(): Promise<void> {
  await connectDatabase();
  const app = createApp();
  const server = createServer(app);
  ioManager.initialize(server);

  server.listen(env.PORT, () => {
    console.log(`FutureDesk backend listening on port ${env.PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});
