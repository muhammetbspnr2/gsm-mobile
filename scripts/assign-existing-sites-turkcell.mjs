#!/usr/bin/env node
/**
 * GSM Mobile — offline, non-destructive site/operator migration.
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
if (inputPath === outputPath) throw new Error("Girdi dosyasının üzerine yazılamaz. Farklı bir --output yolu seçin.");

const raw = await readFile(inputPath, "utf8");
const root = JSON.parse(raw);
if (!root || typeof root !== "object" || Array.isArray(root) || !root.sites || typeof root.sites !== "object" || Array.isArray(root.sites)) {
  throw new Error("Dosya beklenen Firebase JSON yapısında değil veya sites düğümü bulunamadı.");
}
const sites = Object.entries(root.sites).filter(([, site]) => site && typeof site === "object" && !Array.isArray(site));
if (!sites.length) throw new Error("sites düğümünde dönüştürülebilecek saha kaydı bulunamadı.");

const migrated = structuredClone(root);
migrated.operators ||= {};
migrated.companies ||= {};
migrated.operatorSites ||= {};
const norm = value => String(value || "").trim().toLocaleLowerCase("tr-TR");
function findByName(collection, name) {
  return Object.entries(collection).find(([, record]) => record && norm(record.name) === norm(name));
}
function getOrCreate(collection, preferredId, name, extras = {}) {
  const found = findByName(collection, name);
  if (found) return found[0];
  if (Object.prototype.hasOwnProperty.call(collection, preferredId)) {
    throw new Error(`"${preferredId}" anahtarı zaten farklı bir kayıt için kullanılıyor; güvenli otomatik eşleştirme yapılamadı.`);
  }
  collection[preferredId] = { name, active: true, ...extras };
  return preferredId;
}

const operatorId = getOrCreate(migrated.operators, "turkcell", "Turkcell");
const companyId = getOrCreate(migrated.companies, "turkcell-ankara-bolge", "Turkcell Ankara Bölge", { operatorIds: { [operatorId]: true } });
const company = migrated.companies[companyId];
company.operatorIds ||= {};
if (Array.isArray(company.operatorIds)) {
  const legacy = company.operatorIds;
  company.operatorIds = Object.fromEntries(legacy.map(id => [String(id), true]));
}
company.operatorIds[operatorId] = true;
company.active = company.active !== false;

const previousCounts = { total: sites.length, alreadyTargeted: 0, changed: 0, withCoordinates: 0, withSiteNo: 0 };
const keys = new Set(sites.map(([key]) => key));
for (const [key, site] of sites) {
  if (site.operator === "Turkcell" && site.company === "Turkcell Ankara Bölge" && site.operatorId === operatorId && site.companyId === companyId) previousCounts.alreadyTargeted++;
  else previousCounts.changed++;
  if (site.latitude != null || site.lat != null || site.longitude != null || site.lng != null) previousCounts.withCoordinates++;
  if (String(site.siteNo || "").trim()) previousCounts.withSiteNo++;

  const migratedSite = { ...site, operator: "Turkcell", operatorId, company: "Turkcell Ankara Bölge", companyId };
  migrated.sites[key] = migratedSite;
  // Remove stale operator-index copies for the same site before rebuilding its canonical operator entry.
  for (const [otherOperatorId, indexedSites] of Object.entries(migrated.operatorSites)) {
    if (indexedSites && typeof indexedSites === "object" && Object.prototype.hasOwnProperty.call(indexedSites, key) && otherOperatorId !== operatorId) {
      delete migrated.operatorSites[otherOperatorId][key];
    }
  }
  migrated.operatorSites[operatorId] ||= {};
  migrated.operatorSites[operatorId][key] = { ...migratedSite, id: migratedSite.id || key };
}

// Preserve existing unrelated operator indexes and records; remove empty index buckets created by cleanup.
for (const [id, indexedSites] of Object.entries(migrated.operatorSites)) {
  if (indexedSites && typeof indexedSites === "object" && !Array.isArray(indexedSites) && Object.keys(indexedSites).length === 0) {
    delete migrated.operatorSites[id];
  }
}

console.log(JSON.stringify({
  mode: writeOutput ? "write-new-file" : "dry-run",
  input: inputPath,
  output: writeOutput ? outputPath : null,
  totalSites: previousCounts.total,
  alreadyTargeted: previousCounts.alreadyTargeted,
  willBeSetToTurkcellAnkaraBolge: previousCounts.changed,
  sitesWithCoordinateFields: previousCounts.withCoordinates,
  sitesWithSahaNo: previousCounts.withSiteNo,
  targetOperatorId: operatorId,
  targetCompanyId: companyId,
  operatorIndexEntriesCreatedOrUpdated: previousCounts.total,
  preserved: ["Firebase site keys", "all unrelated root nodes", "site IDs", "site numbers", "coordinates", "addresses", "approval/status", "visit and inventory data", "user profiles and access assignments"],
  liveFirebaseTouched: false,
  inputFileOverwritten: false
}, null, 2));

if (writeOutput) {
  await writeFile(outputPath, JSON.stringify(migrated, null, 2) + "\n", { flag: "wx" });
  console.log("Yeni dönüştürülmüş JSON dosyası oluşturuldu:", outputPath);
}
