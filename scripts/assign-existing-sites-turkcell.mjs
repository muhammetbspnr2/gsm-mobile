#!/usr/bin/env node
/**
 * GSM Mobile — offline, non-destructive site operator migration.
 *
 * Reads a Firebase Realtime Database JSON export and writes a SEPARATE JSON
 * file. It never connects to Firebase and never overwrites the input file.
 *
 * Dry run:
 *   node scripts/assign-existing-sites-turkcell.mjs backup.json
 * Write transformed copy:
 *   node scripts/assign-existing-sites-turkcell.mjs backup.json --write-output
 * Optional output path:
 *   node scripts/assign-existing-sites-turkcell.mjs backup.json --write-output --output backup-turkcell.json
 */
import { readFile, writeFile } from "node:fs/promises";
import { resolve, basename, dirname, join } from "node:path";

const args = process.argv.slice(2);
const inputArg = args.find((arg) => !arg.startsWith("--"));
if (!inputArg || args.includes("--help")) {
  console.log("Usage: node scripts/assign-existing-sites-turkcell.mjs <firebase-export.json> [--write-output] [--output <new-file.json>]");
  console.log("Default mode is dry-run; no file is written.");
  process.exit(inputArg ? 0 : 2);
}
const writeOutput = args.includes("--write-output");
const outputIndex = args.indexOf("--output");
const outputArg = outputIndex >= 0 ? args[outputIndex + 1] : null;
if (outputIndex >= 0 && (!outputArg || outputArg.startsWith("--"))) {
  throw new Error("--output sonrasında yeni bir dosya yolu belirtin.");
}

const inputPath = resolve(inputArg);
const outputPath = resolve(outputArg || join(dirname(inputPath), basename(inputPath).replace(/\.json$/i, "") + "-turkcell-migration.json"));
if (inputPath === outputPath) {
  throw new Error("Girdi dosyasının üzerine yazılamaz. Farklı bir --output yolu seçin.");
}

const raw = await readFile(inputPath, "utf8");
const root = JSON.parse(raw);
if (!root || typeof root !== "object" || Array.isArray(root) || !root.sites || typeof root.sites !== "object" || Array.isArray(root.sites)) {
  throw new Error("Dosya beklenen Firebase JSON yapısında değil veya sites düğümü bulunamadı.");
}

const siteEntries = Object.entries(root.sites).filter(([, site]) => site && typeof site === "object" && !Array.isArray(site));
if (siteEntries.length === 0) throw new Error("sites düğümünde dönüştürülebilecek saha kaydı bulunamadı.");

const changed = [];
const beforeCounts = { total: siteEntries.length, alreadyTargeted: 0, toUpdate: 0 };
const migrated = structuredClone(root);

for (const [key, site] of siteEntries) {
  const isTarget = site.operator === "Turkcell" && site.company === "Turkcell Ankara Bölge";
  if (isTarget) beforeCounts.alreadyTargeted++;
  else beforeCounts.toUpdate++;
  migrated.sites[key] = {
    ...site,
    operator: "Turkcell",
    company: "Turkcell Ankara Bölge"
  };
  changed.push(key);
}

console.log(JSON.stringify({
  mode: writeOutput ? "write-new-file" : "dry-run",
  input: inputPath,
  output: writeOutput ? outputPath : null,
  totalSites: beforeCounts.total,
  alreadyTargeted: beforeCounts.alreadyTargeted,
  willBeSetToTurkcellAnkaraBolge: beforeCounts.toUpdate,
  preserved: ["Firebase site keys", "all other root nodes", "site IDs", "site numbers", "coordinates", "addresses", "approval/status", "visit and inventory data"],
  liveFirebaseTouched: false,
  inputFileOverwritten: false
}, null, 2));

if (writeOutput) {
  await writeFile(outputPath, JSON.stringify(migrated, null, 2) + "\n", { flag: "wx" });
  console.log("Yeni dönüştürülmüş JSON dosyası oluşturuldu:", outputPath);
}
