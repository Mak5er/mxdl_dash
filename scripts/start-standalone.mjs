import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const standaloneServer = join(root, ".next", "standalone", "server.js");
const { loadEnvConfig } = nextEnv;

if (!existsSync(standaloneServer)) {
  console.error("Standalone build is missing. Run `npm run build` first.");
  process.exit(1);
}

process.env.NODE_ENV ||= "production";
process.env.HOSTNAME ||= "0.0.0.0";
process.env.PORT ||= "3000";

loadEnvConfig(root, false);

const require = createRequire(import.meta.url);
require(standaloneServer);
