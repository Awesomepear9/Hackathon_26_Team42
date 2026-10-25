// Baut die eigenständige Praxismodul-App (apps/praxismodul, Vite) für den Pfad /apps/praxismodul/
// und legt das Ergebnis in public/apps/praxismodul ab, wo Next.js es als statische Dateien ausliefert.
// Aufruf: node scripts/build-praxismodul.mjs [--if-missing]
import { execSync } from "node:child_process";
import { cpSync, existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const app = `${root}apps/praxismodul`;
const target = `${root}public/apps/praxismodul`;
const BASE = "/apps/praxismodul/";

if (process.argv.includes("--if-missing") && existsSync(`${target}/index.html`)) {
  console.log("Praxismodul ist bereits gebaut (public/apps/praxismodul).");
  process.exit(0);
}

const run = (cmd) => execSync(cmd, { cwd: app, stdio: "inherit" });

if (!existsSync(`${app}/node_modules`)) run("npm ci");
run(`npx tsc --noEmit && npx vite build --base=${BASE}`);

rmSync(target, { recursive: true, force: true });
cpSync(`${app}/dist`, target, { recursive: true });
console.log(`Praxismodul gebaut: ${target}`);
