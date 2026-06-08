#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(__dirname, "templates");

function fail(message) {
  console.error(`create-two-go: ${message}`);
  process.exit(1);
}

function isEmptyDir(dir) {
  return fs.readdirSync(dir).length === 0;
}

function copyTemplates(srcDir, destDir, projectName) {
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);

    // Rename _gitignore to .gitignore so it ships inside the package.
    let destName = entry.name === "_gitignore" ? ".gitignore" : entry.name;
    const destPath = path.join(destDir, destName);

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyTemplates(srcPath, destPath, projectName);
      continue;
    }

    if (entry.name === "package.json") {
      const pkg = JSON.parse(fs.readFileSync(srcPath, "utf8"));
      pkg.name = projectName;
      fs.writeFileSync(destPath, JSON.stringify(pkg, null, 2) + "\n");
      continue;
    }

    fs.copyFileSync(srcPath, destPath);
  }
}

function main() {
  const arg = process.argv[2];
  const projectName = arg && arg.trim() ? arg.trim() : "two-go-app";
  const targetDir = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(targetDir)) {
    const stat = fs.statSync(targetDir);
    if (!stat.isDirectory()) {
      fail(`target "${projectName}" exists and is not a directory.`);
    }
    if (!isEmptyDir(targetDir)) {
      fail(`target directory "${projectName}" already exists and is not empty.`);
    }
  } else {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  copyTemplates(templatesDir, targetDir, projectName);

  console.log(`Created a new two-go project in ${targetDir}`);
  console.log("");
  console.log("Next steps:");
  console.log(`  cd ${projectName}`);
  console.log("  npm install");
  console.log("  npm test");
}

try {
  main();
} catch (err) {
  fail(err && err.message ? err.message : String(err));
}
