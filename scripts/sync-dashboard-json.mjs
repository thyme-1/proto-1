import fs from "node:fs/promises";
import path from "node:path";

/**
 * Copies `data/dashboard.json` into `public/data/dashboard.json`.
 *
 * Why:
 * - The source-of-truth JSON lives in the repo at `data/dashboard.json`.
 * - Next.js serves files in `public/` as static assets, so the client can
 *   `fetch("/data/dashboard.json")` in any deployment (Vercel/Netlify/etc).
 */
async function main() {
  const repoRoot = process.cwd();
  const src = path.join(repoRoot, "data", "dashboard.json");
  const destDir = path.join(repoRoot, "public", "data");
  const dest = path.join(destDir, "dashboard.json");

  await fs.mkdir(destDir, { recursive: true });
  const json = await fs.readFile(src, "utf8");
  await fs.writeFile(dest, json, "utf8");
  console.log(`Synced ${src} -> ${dest}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

