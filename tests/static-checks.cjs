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
  importer: read("site-import.js")
};
const version = "2.3.0";

for (const [name, html] of [["index.html", files.index], ["admin.html", files.admin]]) {
  assert.match(html, new RegExp("v=" + version.replaceAll(".", "\\.") + "(?:[\"'])"), name + " asset query versions must be aligned");
  assert.match(html, new RegExp("v" + version.replaceAll(".", "\\.") + "<"), name + " visible footer version must be aligned");
  assert.doesNotMatch(html, /v=2\.2\.9|v2\.2\.12/, name + " contains stale cache/version markers");
}
assert.match(files.pwa, /const VERSION = "2\.3\.0"/, "PWA label/service-worker registration version must be current");
assert.match(files.sw, /const VERSION = "2\.3\.0"/, "service worker cache version must be current");
assert.match(files.manifest, /app-icon-tower\.svg\?v=2\.3\.0/, "manifest icon URLs must be versioned");
assert.doesNotMatch(files.importer, /\^\\\\d\+\$/, "importer must not use the incorrectly double-escaped numeric regex");
assert.match(files.importer, /!\^\\d\+\$\/.test\(no\)/, "preview numeric Saha No validation must use digit regex");
assert.match(files.importer, /\(no&&!\^\\d\+\$\/.test\(no\)\)/, "commit numeric Saha No validation must use digit regex");

JSON.parse(files.manifest);
JSON.parse(read("database.rules.json"));
for (const file of ["app.js", "admin.js", "site-import.js", "map.js", "pwa.js", "sw.js"]) {
  assert.ok(fs.existsSync(path.join(root, file)), file + " must exist");
}
for (const [name, html] of [["index.html", files.index], ["admin.html", files.admin]]) {
  for (const id of ["authMessage", "appView"]) {
    if (name === "index.html") assert.ok(html.includes('id="' + id + '"'), name + " must retain " + id);
  }
}
console.log("Static quality checks passed: version alignment, manifest/rules JSON, and Saha No import validation.");
