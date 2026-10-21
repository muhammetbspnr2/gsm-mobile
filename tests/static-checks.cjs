"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const files = {
  index: read("index.html"),
  admin: read("admin.html"),
  app: read("app.js"),
  adminJs: read("admin.js"),
  importer: read("site-import.js"),
  tenantSites: read("tenant-sites.js"),
  pwa: read("pwa.js"),
  sw: read("sw.js"),
  theme: read("theme.js"),
  css: read("style.css"),
  manifest: JSON.parse(read("manifest.webmanifest")),
  rules: JSON.parse(read("database.rules.json")),
  config: JSON.parse(read("firebase.json")),
  alias: JSON.parse(read(".firebaserc")),
  firebaseConfig: read("firebase-config.js")
};
const version = "2.8.1";

for (const [name, html] of [["index.html", files.index], ["admin.html", files.admin]]) {
  assert.match(html, new RegExp("style\\.css\\?v=" + version.replaceAll(".", "\\.") + "(?:[\"'])"), name + " must load current CSS");
  assert.match(html, new RegExp("pwa\\.js\\?v=" + version.replaceAll(".", "\\.") + "(?:[\"'])"), name + " must load current PWA helper");
  assert.match(html, new RegExp("v" + version.replaceAll(".", "\\.") + "<"), name + " visible release version must be aligned");
  assert.doesNotMatch(html, /v=2\.2\.9|v2\.2\.12|v2\.6\.3/, name + " contains stale cache/version markers");
}
assert.equal((files.admin.match(/data-admin-tab="/g) || []).length, 15, "all 15 admin sections must remain accessible");
for (const section of ["users","profileChanges","requests","companies","sites","openSites","visitHistory","proximity","siteImport","equipmentChanges","contactMessages","notify","activity","news","tools"]) {
  assert.ok(files.admin.includes('data-admin-tab="' + section + '"'), "missing admin section: " + section);
}
assert.equal(files.pwa.includes('const VERSION = "' + version + '"'), true, "PWA version must be current");
assert.equal(files.sw.includes('const VERSION = "' + version + '"'), true, "service-worker cache version must be current");
assert.ok(files.manifest.icons.every(icon => icon.src.includes("?v=" + version)), "PWA icon URLs must be versioned");
assert.equal(files.manifest.name, "GSM Mobile");
assert.equal(files.manifest.start_url, "./");
assert.ok(files.manifest.icons.some(icon => icon.sizes === "192x192") && files.manifest.icons.some(icon => icon.sizes === "512x512"), "PWA icon sizes must be declared");
assert.ok(files.theme.includes('root.dataset.theme = "light"'), "the chosen permanent light theme must be enforced");
assert.ok(files.theme.includes('el.remove()'), "theme switching controls must stay disabled");
assert.ok(files.css.includes("--red:#e60000") && files.css.includes("--red-soft:#fff0f0"), "shared red-white design tokens must exist");

assert.ok(files.app.includes("sendEmailVerification") && files.app.includes("emailVerified"), "email verification flow must remain");
assert.ok(files.app.includes(".info/connected"), "Firebase connection status must remain");
assert.ok(files.app.includes("equipmentAccessGranted"), "equipment access gate must remain");
assert.ok(files.tenantSites.includes('orderByChild("approved").equalTo(true)'), "personnel must query approved sites from operator-scoped catalogues");
assert.ok(files.tenantSites.includes("operatorSites/"), "operator-scoped site index helper must exist");
assert.ok(files.tenantSites.includes("profileOperatorIds"), "users must support one or multiple operator assignments");
assert.ok(files.importer.includes('updates["operatorSites/"+targetOperatorId+"/"+key]'), "site import must update the operator catalogue index");
assert.ok(files.adminJs.includes('updates["operatorSites/"+operatorId+"/"+siteRef.key]'), "manual site creation must update the operator catalogue index");
assert.ok(files.app.includes("/^[A-Z0-9]{5}$/"), "Saha ID must be exactly five uppercase alphanumeric characters");
assert.ok(files.app.includes("function pendingVisitWriteKey(") && files.app.includes("async function syncPendingVisitNotes()"), "offline visit-note queue must remain");
assert.ok(files.app.includes("historySnap.exists()"), "duplicate checkout protection must remain");
assert.ok(files.app.includes("visitWorkNotes") && files.app.includes("visitOutcome"), "visit notes and result flow must remain");
assert.ok(files.app.includes("function renderNews(data)") && files.adminJs.includes("function renderAdminNews()"), "news feed and admin publishing must remain");
assert.ok(files.admin.includes('id="adminAddSiteBtn"') && files.admin.includes('id="adminSiteForm"'), "admin site creation must remain");
assert.ok(!files.index.includes('id="siteForm"') && !files.index.includes('id="getLocation"') && !files.index.includes("Yeni saha başvurusu"), "personnel must not be able to create sites");
assert.ok(files.admin.includes('id="adminNewsImageFile"'), "admin news image upload must remain");
assert.ok(files.admin.includes('id="adminNewsCommentRows"'), "admin news moderation must remain");
assert.ok(files.admin.includes('data-admin-tab="contactMessages"'), "admin contact inbox must remain");
assert.ok(files.adminJs.includes("contactMessages"), "contact message handling must remain");

assert.ok(files.importer.includes("function parseCsv(") && files.importer.includes("function parseKml("), "CSV and KML parsers must remain");
assert.ok(files.importer.includes('ext==="kmz"') && files.importer.includes("JSZip.loadAsync(file)"), "KMZ support must remain");
assert.ok(files.importer.includes("duplicateId") && files.importer.includes("duplicateNo"), "import preview must detect duplicate site IDs and numbers");
assert.match(files.importer, /!\/\^\\d\+\$\/\.test\(no\)/, "import must validate non-empty Saha No as digits");
assert.ok(files.importer.includes("await db.ref().update(updates)"), "import must merge site records rather than replace the database");
assert.ok(files.importer.includes("importedIndexes"), "partial import must preserve skipped rows for correction");
assert.ok(files.importer.includes("Koordinat") || files.importer.includes("coordinates"), "import must retain coordinate parsing");

assert.ok(files.rules.rules.visitHistory["$visitId"][".read"].includes(".matches("), "visit-history reads must be scoped to the owner");
assert.ok(files.rules.rules.siteRequests["$requestId"][".write"].includes("root.child('admins').child(auth.uid).val() === true"), "site requests must be admin-only");
assert.ok(files.rules.rules.sites["$siteId"][".write"].includes("root.child('admins').child(auth.uid).val() === true"), "site writes must be admin-only");
assert.ok(files.rules.rules.sites[".read"].includes("root.child('admins').child(auth.uid).val() === true"), "the shared site root must not be readable by every active user");
assert.ok(files.rules.rules.operatorSites["$operatorId"][".read"].includes("query.orderByChild === 'approved'"), "operator catalogue reads must require an approved-sites query");
assert.ok(files.rules.rules.equipment["$siteId"]["$equipmentId"][".write"].includes("openVisits"), "equipment writes must require an active visit");
assert.equal(files.config.database.rules, "database.rules.json");
assert.equal(files.alias.projects.default, "spu-personal");
assert.doesNotMatch(files.firebaseConfig, /BEGIN [A-Z ]*PRIVATE KEY|private_key/i, "Firebase web config must not contain a service-account private key");
for (const file of ["app.js","admin.js","site-import.js","map.js","pwa.js","sw.js","theme.js","admin-nav.js","tenant-sites.js"]) {
  assert.ok(fs.existsSync(path.join(root, file)), file + " must exist");
}
console.log("Static quality checks passed: 2.8.1 release, red-white design, responsive navigation, Firebase protections, imports, visits, news, contact inbox and PWA cache.");
