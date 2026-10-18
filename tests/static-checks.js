const fs = require("node:fs");
const assert = require("node:assert/strict");

const read = (p) => fs.readFileSync(p, "utf8");
const index = read("index.html");
const adminHtml = read("admin.html");
const app = read("app.js");
const admin = read("admin.js");
const config = read("firebase-config.js");
const rulesText = read("database.rules.json");
const rules = JSON.parse(rulesText);

function uniqueIds(html, name) {
  const ids = [...html.matchAll(/\\bid=["']([^"']+)["']/g)].map((m) => m[1]);
  assert.equal(ids.length, new Set(ids).size, name + " HTML contains duplicate IDs");
}
uniqueIds(index, "Personnel");
uniqueIds(adminHtml, "Admin");

assert.match(index, /v1\\.0\\.\\d+/, "Personnel version marker is missing");
assert.match(app, /sendEmailVerification/, "Email verification flow is missing");
assert.match(app, /emailVerified/, "Unverified-email gate is missing");
assert.match(app, /\\.info\\/connected/, "Firebase connection status is missing");
assert.match(app, /equipmentAccessGranted/, "Equipment access gate is missing");
assert.match(app, /historyId=auth\\.currentUser\\.uid\+"_"\+String\\(checkInAt\\)/, "Stable visit history ID is missing");
assert.match(app, /historySnap\\.exists\\(\\)/, "Duplicate checkout protection is missing");
assert.match(admin, /backup-restore/, "Restore audit log is missing");
assert.match(admin, /JSON\\.parse\\(await file\\.text\\(\\)\\)/, "Restore JSON validation is missing");
assert.match(admin, /\\\\r\\\\n/, "CSV export should use CRLF line endings");
assert.match(rules.rules.visitHistory["$visitId"][".write"], /openVisits/);
assert.match(rules.rules.visitHistory["$visitId"][".write"], /checkOutAt/);
assert.match(rules.rules.visitHistory["$visitId"][".write"], /durationMs/);
assert.doesNotMatch(config, /BEGIN [A-Z ]*PRIVATE KEY|private_key/i, "Firebase web config must not contain a service-account private key");

console.log("Static checks passed: HTML IDs, version, email verification, connection status, equipment gate, duplicate checkout protection, restore safeguards, CSV formatting, RTDB visit-history rules, and client config secret scan.");
