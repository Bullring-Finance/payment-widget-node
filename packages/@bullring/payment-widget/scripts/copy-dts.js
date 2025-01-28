// scripts/copy-dts.js
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function copyTypeDefinitions() {
  const frameworksDir = path.join(__dirname, "../src/types/frameworks");
  const distDir = path.join(__dirname, "../dist/types/frameworks");

  // Ensure the destination directory exists
  await fs.ensureDir(distDir);

  // Copy framework type definitions
  await fs.copy(frameworksDir, distDir);

  console.log("✓ Type definitions copied successfully");
}

copyTypeDefinitions().catch(console.error);
