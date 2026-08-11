import sharp from "sharp";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const brand = dirname(fileURLToPath(import.meta.url));
const sizes = [32, 64, 128, 256, 512];
const logo = readFileSync(join(brand, "logo.svg"));
const mark = readFileSync(join(brand, "logo-mark.svg"));

for (const s of sizes) {
  await sharp(logo).resize(s, s).png().toFile(join(brand, `logo-${s}.png`));
  await sharp(mark).resize(s, s).png().toFile(join(brand, `logo-mark-${s}.png`));
  console.log(`logo-${s}.png + logo-mark-${s}.png`);
}
await sharp(logo).resize(180, 180).png().toFile(join(brand, "apple-touch-icon.png"));
console.log("apple-touch-icon.png");
