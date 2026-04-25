import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const standaloneRoot = join(root, ".next", "standalone");

const copies = [
  {
    from: join(root, "public"),
    to: join(root, ".next", "standalone", "public"),
    optional: true,
  },
  {
    from: join(root, ".next", "static"),
    to: join(root, ".next", "standalone", ".next", "static"),
    optional: false,
  },
];

for (const { from, to, optional } of copies) {
  if (!existsSync(from)) {
    if (optional) {
      continue;
    }

    throw new Error(`Required standalone asset source is missing: ${from}`);
  }

  mkdirSync(dirname(to), { recursive: true });

  if (existsSync(to)) {
    rmSync(to, { recursive: true, force: true });
  }

  cpSync(from, to, { recursive: true });
}

if (existsSync(standaloneRoot)) {
  for (const entry of readdirSync(standaloneRoot)) {
    if (entry === ".env" || entry.startsWith(".env.")) {
      rmSync(join(standaloneRoot, entry), { force: true });
    }
  }
}

console.log("Copied public and .next/static assets into .next/standalone.");
