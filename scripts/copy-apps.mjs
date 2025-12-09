import { cpSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dist = join(root, "dist");

const APP_MAPPINGS = [
  // Experiments (submodules)
  { src: "apps/experiments/blob", dest: "experiments/blob" },
  { src: "apps/experiments/chaos-game", dest: "experiments/chaos-game" },
  { src: "apps/experiments/clock", dest: "experiments/clock" },
  { src: "apps/experiments/cloth", dest: "experiments/cloth" },
  { src: "apps/experiments/dripsessions", dest: "experiments/dripsessions" },
  { src: "apps/experiments/entropy", dest: "experiments/entropy" },
  { src: "apps/experiments/fractals", dest: "experiments/fractals" },
  { src: "apps/experiments/mobeh", dest: "experiments/mobeh" },
  { src: "apps/experiments/muda", dest: "experiments/muda" },
  { src: "apps/experiments/numbers", dest: "experiments/numbers" },
  { src: "apps/experiments/particle_system", dest: "experiments/particle_system" },
  { src: "apps/experiments/rain", dest: "experiments/rain" },
  { src: "apps/experiments/robotarm", dest: "experiments/robotarm" },
  { src: "apps/experiments/something_a_day", dest: "experiments/something_a_day" },
  { src: "apps/experiments/sudoku", dest: "experiments/sudoku" },
  { src: "apps/experiments/tumbler", dest: "experiments/tumbler" },
  { src: "apps/experiments/walking", dest: "experiments/walking" },
  { src: "apps/experiments/zoetrope", dest: "experiments/zoetrope" },

  // Special case: svg-animations-src maps to svg-animations
  { src: "apps/experiments/svg-animations-src", dest: "experiments/svg-animations" },

  // Local experiments (not submodules)
  { src: "apps/experiments/buttholes", dest: "experiments/buttholes" },
  { src: "apps/experiments/wordstellations", dest: "experiments/wordstellations" },

  // Other apps
  { src: "apps/inkling", dest: "inkling" },
  { src: "apps/swipe-sudoku", dest: "swipe-sudoku" },
];

function copyApps() {
  console.log("Copying apps to dist...\n");

  for (const { src, dest } of APP_MAPPINGS) {
    const srcPath = join(root, src);
    const destPath = join(dist, dest);

    if (existsSync(srcPath)) {
      mkdirSync(dirname(destPath), { recursive: true });
      cpSync(srcPath, destPath, { recursive: true });
      console.log(`  ${src} -> dist/${dest}`);
    } else {
      console.warn(`  Warning: Source not found: ${src}`);
    }
  }

  console.log("\nDone copying apps.");
}

copyApps();
