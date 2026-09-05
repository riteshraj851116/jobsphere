import fs from "node:fs";

try {
  if (fs.existsSync("dist/index.html")) {
    fs.copyFileSync("dist/index.html", "dist/404.html");
  }
} catch (e) {
  // Ignored
}
