const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "public");
const distDir = path.join(__dirname, "dist");

fs.mkdirSync(distDir, { recursive: true });
for (const file of fs.readdirSync(srcDir)) {
  fs.copyFileSync(path.join(srcDir, file), path.join(distDir, file));
}
console.log("✅ Build concluído: arquivos estáticos copiados para dist/");
