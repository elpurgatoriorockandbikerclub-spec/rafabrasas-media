import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, ".pages-stage");
const manifest = JSON.parse(await fs.readFile(path.join(root, "approved.json"), "utf8"));
if (!Array.isArray(manifest) || manifest.length > 19999) throw new Error("Invalid Pages Free catalog size");

const names = new Set();
for (const entry of manifest) {
  if (!entry || typeof entry.path !== "string" || !/^(brand|media)\/[A-Za-z0-9_./-]+$/.test(entry.path) || entry.path.includes("..") || !Number.isInteger(entry.bytes) || entry.bytes < 1 || entry.bytes > 25 * 1024 * 1024 || !/^[a-f0-9]{64}$/.test(entry.sha256)) throw new Error("Invalid approved media entry");
  if (names.has(entry.path)) throw new Error(`Duplicate approved media path: ${entry.path}`);
  names.add(entry.path);
}

try {
  const previous = JSON.parse(execFileSync("git", ["show", "HEAD^:approved.json"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
  if (!Array.isArray(previous)) throw new Error("Previous catalog was invalid");
  for (const old of previous) {
    const current = manifest.find(entry => entry.path === old.path);
    if (!current || current.bytes !== old.bytes || current.sha256 !== old.sha256) throw new Error(`Previously published media removed or changed: ${old.path}`);
  }
} catch (error) {
  if (error?.status !== 128) throw error;
  // The initial commit has no parent catalog.
}

async function walk(directory, prefix) {
  for (const item of await fs.readdir(directory, { withFileTypes: true })) {
    const relative = `${prefix}/${item.name}`;
    if (item.isDirectory()) await walk(path.join(directory, item.name), relative);
    else if (!item.isFile() || !names.has(relative)) throw new Error(`Unapproved or linked media file: ${relative}`);
  }
}
await walk(path.join(root, "brand"), "brand");
await walk(path.join(root, "media"), "media");

if (process.argv[2] === "stage") {
  await fs.rm(output, { recursive: true, force: true });
  await fs.mkdir(output, { recursive: true });
}
let total = 0;
for (const entry of manifest) {
  const source = path.join(root, entry.path);
  const info = await fs.lstat(source);
  if (!info.isFile() || info.isSymbolicLink() || info.size !== entry.bytes) throw new Error(`Source differs from catalog: ${entry.path}`);
  const bytes = await fs.readFile(source);
  if (createHash("sha256").update(bytes).digest("hex") !== entry.sha256) throw new Error(`Hash differs from catalog: ${entry.path}`);
  total += bytes.length;
  if (process.argv[2] === "stage") {
    const destination = path.join(output, entry.path);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, bytes);
  }
}
if (process.argv[2] === "stage") await fs.copyFile(path.join(root, "index.html"), path.join(output, "index.html"));
else if (process.argv[2] !== "check") throw new Error("Usage: node scripts/verify.mjs check|stage");
console.log(`Verified ${manifest.length} approved files and ${total} bytes; ${process.argv[2] === "stage" ? "staged full catalog" : "no deployment"}.`);
