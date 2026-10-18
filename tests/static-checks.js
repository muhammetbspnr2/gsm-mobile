const fs = require("node:fs");
const assert = require("node:assert/strict");

const read = (p) => fs.readFileSync(p, "utf8");
const index = read("index.html");
const adminHtml = read("admin.html");
const app = read("app.js");
const admin = read("admin.js");
const config = read("firebase-config.js");
const rules = JSON.parse(read("database.rules.json"));

function uniqueIds(html, name) {
  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map((m) => m[1]);
  assert.equal(ids.length, new Set(ids).size, name + " HTML contains duplicate IDs");
}
uniqueIds(index, "Personnel");
uniqueIds(adminHtml, "Admin");

assert.match(index, /v1\.0\.\d+/, "Personnel version marker is missing");
assert.ok(app.includes("sendEmailVerification"), "Email verification flow is missing");
assert.ok(app.includes("emailVerified"), "Unverified-email gate is missing");
assert.ok(app.includes(".info/connected"), "Firebase connection status is missing");
assert.ok(app.includes("equipmentAccessGranted"), "Equipment access gate is missing");
assert.ok(app.includes('historyId=auth.currentUser.uid+"_"+String(checkInAt)'), "Stable visit history ID is missing");
assert.ok(app.includes("historySnap.exists()"), "Duplicate checkout protection is missing");
assert.ok(admin.includes("backup-restore"), "Restore audit log is missing");
assert.ok(admin.includes("JSON.parse(await file.text())"), "Restore JSON validation is missing");
assert.ok(admin.includes('\\r\\n'), "CSV export should use CRLF line endings");
assert.ok(rules.rules.visitHistory["$visitId"][".write"].includes("openVisits"), "Visit history must be tied to an active visit");
assert.ok(rules.rules.visitHistory["$visitId"][".write"].includes("checkOutAt"), "Visit history must validate checkout time");
assert.ok(rules.rules.visitHistory["$visitId"][".write"].includes("durationMs"), "Visit history must validate duration");
assert.doesNotMatch(config, /BEGIN [A-Z ]*PRIVATE KEY|private_key/i, "Firebase web config must not contain a service-account private key");

console.log("Static checks passed: HTML IDs, version, email verification, connection status, equipment gate, duplicate checkout protection, restore safeguards, CSV formatting, RTDB visit-history rules, and client config secret scan.");
