import fs from "node:fs";
import path from "node:path";

function copyRecursive(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyRecursive(from, to);
    else {
      try {
        fs.copyFileSync(from, to);
      } catch (err) {
        // On Windows, live PGlite files may be locked by `next dev`.
        console.warn(`Skipped locked file: ${from} (${(err as Error).message})`);
      }
    }
  }
}

function main() {
  const webRoot = process.cwd();
  const dataDir = process.env.PGLITE_DATA_DIR
    ? path.isAbsolute(process.env.PGLITE_DATA_DIR)
      ? process.env.PGLITE_DATA_DIR
      : path.resolve(webRoot, process.env.PGLITE_DATA_DIR)
    : path.join(webRoot, ".data", "pglite");

  if (!fs.existsSync(dataDir)) {
    throw new Error(`No PGlite data directory at ${dataDir}`);
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const destRoot = path.resolve(webRoot, "..", "backups", `pglite-${stamp}`);
  copyRecursive(dataDir, destRoot);

  const uploads = path.join(webRoot, ".data", "uploads");
  if (fs.existsSync(uploads)) {
    copyRecursive(uploads, path.join(destRoot, "uploads"));
  }

  console.log(`Backup written to ${destRoot}`);
}

main();
