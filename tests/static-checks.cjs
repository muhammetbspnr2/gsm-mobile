const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const files = {
  index: read("index.html"),
  admin: read("admin.html"),
  pwa: read("pwa.js"),
  sw: read("sw.js"),
  manifest: read("manifest.webmanifest"),
  importer: read("site-import.js"),
  app: read("app.js")
};
const version = "2.7.2";

for (const [name, html] of [["index.html", files.index], ["admin.html", files.admin]]) {
  assert.match(html, new RegExp("v=" + version.replaceAll(".", "\\.") + "(?:[\"'])"), name + " asset query versions must be aligned");
  assert.match(html, new RegExp("v" + version.replaceAll(".", "\\.") + "<"), name + " visible footer version must be aligned");
  assert.doesNotMatch(html, /v=2\.2\.9|v2\.2\.12/, name + " contains stale cache/version markers");
}
assert.ok(files.pwa.includes('const VERSION = "2.7.2"'), "PWA label/service-worker registration version must be current");
assert.ok(files.sw.includes('const VERSION = "2.5.8"'), "service worker cache version must be current");
assert.ok(files.manifest.includes("app-icon-tower.svg?v=2.7.2"), "manifest icon URLs must be versioned");
assert.match(files.admin, /class="admin-nav-group"/, "admin navigation must be grouped by work area");
assert.equal((files.admin.match(/data-admin-tab="/g)||[]).length, 15, "all admin sections must remain accessible");
assert.match(files.index, /style\.css\?v=2\.7\.2/, "personnel design system must be versioned");
assert.match(files.index, /theme\.js\?v=2\.7\.2/, "personnel theme switcher must be loaded");
assert.match(files.admin, /theme\.js\?v=2\.7\.2/, "admin theme switcher must be loaded");
assert.match(read("style.css"), /--gm-red:#e60000/, "red-white design tokens must be defined");
assert.match(read("theme.js"), /root\.dataset\.theme = "light"/, "permanent light theme must be enforced");
assert.doesNotMatch(files.importer, /\^\\\\d\+\$/, "importer must not use the incorrectly double-escaped numeric regex");
assert.match(files.importer, /no&&!\/\^\\d\+\$\/\.test\(no\)/, "preview numeric Saha No validation must use digit regex");
assert.match(files.importer, /\(no&&!\/\^\\d\+\$\/\.test\(no\)\)/, "commit numeric Saha No validation must use digit regex");
assert.ok(files.app.includes("function pendingVisitWriteKey("), "offline visit-note queue helper must exist");
assert.ok(files.app.includes("async function syncPendingVisitNotes()"), "pending visit-note sync helper must exist");
assert.ok(files.app.includes("window.setTimeout(syncPendingVisitNotes,500)"), "pending visit notes must be retried after connection/login");
assert.ok(files.app.includes("Bağlantı yok. Saha çıkışı sunucuya güvenli biçimde kaydedilemedi"), "checkout must be blocked while offline");
assert.ok(files.app.includes("if(pending.siteRecordId===v.siteRecordId&&Number(pending.checkInAt)===Number(v.checkInAt))localStorage.removeItem(pendingKey)"), "a different visit queue must never be discarded by a normal save");

JSON.parse(files.manifest);
const rules = JSON.parse(read("database.rules.json"));
const firebaseConfig = JSON.parse(read("firebase.json"));
const projectAlias = JSON.parse(read(".firebaserc"));
assert.equal(firebaseConfig.database.rules, "database.rules.json", "Firebase CLI must publish the reviewed rules file");
assert.equal(projectAlias.projects.default, "spu-personal", "Firebase project alias must match the documented project");
assert.match(rules.rules.visitHistory["$visitId"][".read"], /\.matches\(/, "personnel must be able to read only their own visit-history key");
assert.match(rules.rules.openVisits["$uid"][".validate"], /data\.exists\(\)/, "open visit identity must be immutable after creation");
for (const file of ["app.js", "admin.js", "site-import.js", "map.js", "pwa.js", "sw.js", "theme.js"]) {
  assert.ok(fs.existsSync(path.join(root, file)), file + " must exist");
}
for (const [name, html] of [["index.html", files.index], ["admin.html", files.admin]]) {
  for (const id of ["authMessage", "appView"]) {
    if (name === "index.html") assert.ok(html.includes('id="' + id + '"'), name + " must retain " + id);
  }
}
console.log("Static quality checks passed: release versions, JSON/Firebase config, import validation, offline queue, and visit-history access rules.");

assert.doesNotMatch(files.index, /id="siteForm"|id="getLocation"|Yeni saha başvurusu/, "personnel panel must not offer site creation");
assert.match(rules.rules.siteRequests["$requestId"][".write"], /root\.child\('admins'\)\.child\(auth\.uid\)\.val\(\) === true/, "only admins may create or change site requests");
assert.match(rules.rules.sites["$siteId"][".write"], /root\.child\('admins'\)\.child\(auth\.uid\)\.val\(\) === true/, "only admins may write site records");
