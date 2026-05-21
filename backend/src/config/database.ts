import dns from "node:dns";
import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase(): Promise<void> {
  const dnsServers = env.DNS_SERVERS.split(",")
    .map((server) => server.trim())
    .filter(Boolean);

  if (dnsServers.length > 0) {
    dns.setServers(dnsServers);
  }

  await mongoose.connect(env.MONGODB_URI, {
    dbName: "futuredesk"
  });
}
