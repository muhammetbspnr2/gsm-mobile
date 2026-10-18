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
assert.ok(adminHtml.includes('id="adminAddSiteBtn"'), "Admin site creation button is missing");
assert.ok(adminHtml.includes('id="adminSiteForm"'), "Admin site creation form is missing");
assert.ok(adminHtml.includes('id="adminSiteAddress" required'), "Admin site address must be required");
assert.ok(!adminHtml.includes('id="adminSiteLat"') && !adminHtml.includes('id="adminSiteLng"'), "Admin site form must not request GPS coordinates");
assert.ok(admin.includes('site-create-admin') && admin.includes('approved:true'), "Admin-created sites must be audited and approved");
assert.ok(app.includes('orderByChild("approved").equalTo(true)'), "Personnel approved-site directory query is missing");
assert.ok(app.includes('/^[A-Z0-9]{5}$/'), "Personnel site ID must be exactly five characters");
assert.ok(rules.rules.sites[".indexOn"].includes("approved"), "Approved sites query must be indexed");
assert.ok(rules.rules.sites[".read"].includes("query.orderByChild === \'approved\'"), "Database rules must authorize approved-site queries");

assert.ok(admin.includes('\\r\\n'), "CSV export should use CRLF line endings");
assert.ok(rules.rules.visitHistory["$visitId"][".write"].includes("openVisits"), "Visit history must be tied to an active visit");
assert.ok(rules.rules.visitHistory["$visitId"][".write"].includes("checkOutAt"), "Visit history must validate checkout time");
assert.ok(rules.rules.visitHistory["$visitId"][".write"].includes("durationMs"), "Visit history must validate duration");
assert.doesNotMatch(config, /BEGIN [A-Z ]*PRIVATE KEY|private_key/i, "Firebase web config must not contain a service-account private key");

console.log("Static checks passed: HTML IDs, version, email verification, connection status, equipment gate, duplicate checkout protection, restore safeguards, CSV formatting, RTDB visit-history rules, and client config secret scan.");
