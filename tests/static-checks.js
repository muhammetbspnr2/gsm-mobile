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


assert.ok(index.includes('id="homeNewsFeed"') && index.includes('id="viewAllNewsBtn"'), "Dashboard news feed and all-news button are required");
assert.ok(index.includes('id="newsArea"') && index.includes('data-page="newsArea"'), "Personnel all-news page and navigation tab are required");
assert.ok(index.includes('id="dashSiteCount"') && index.includes('id="dashMonthCount"') && index.includes('id="recentSiteCards"'), "Site summaries must remain available in Reports");
assert.ok(app.includes("function renderNews(data)") && app.includes("rows.slice(0,5)"), "Personnel news feed must render the latest five posts");
assert.ok(app.includes('db.ref("news").on("value"'), "Personnel news must update from Firebase");
assert.ok(adminHtml.includes('id="section-news"') && adminHtml.includes('data-admin-tab="news"'), "Admin news management section is missing");
assert.ok(adminHtml.includes('id="adminNewsForm"') && adminHtml.includes('id="adminNewsTitle"') && adminHtml.includes('id="adminNewsBody"'), "Admin news publishing form is incomplete");
assert.ok(admin.includes("function renderAdminNews()") && admin.includes('db.ref("news").on("value"'), "Admin news list and realtime listener are required");
assert.ok(admin.includes('logAudit("news-create"') && admin.includes('logAudit("news-update"') && admin.includes('logAudit("news-delete"'), "News create, update and delete actions must be audited");
assert.ok(rules.rules.news[".read"].includes("access") && rules.rules.news[".write"].includes("admins"), "News must be readable by active staff and writable only by admins");
assert.ok(index.includes("1.0.671") && adminHtml.includes("1.0.671"), "Both panels must use version 1.0.671");
assert.ok(adminHtml.includes('id="adminNewsImageFile"') && adminHtml.includes('id="adminNewsImagePreview"'), "Admin must support direct image file selection and preview");
assert.ok(admin.includes("function compressNewsImage(file)") && admin.includes("350*1024"), "Selected news images must be compressed before saving");
assert.ok(admin.includes("data-delete-news") && admin.includes("news-delete"), "Admin must be able to delete news posts with audit logging");
assert.ok(app.includes("data:image"), "Personnel news must support embedded uploaded image data");

console.log("Static checks passed: HTML IDs, version, email verification, connection status, equipment gate, duplicate checkout protection, restore safeguards, CSV formatting, RTDB visit-history rules, and client config secret scan.");

assert.ok(app.includes("data-news-like") && app.includes("data-news-comment-form"), "Personnel news must support reactions and comments");
assert.ok(app.includes("newsReactions") && app.includes("newsComments") && app.includes("news-comment-form"), "Personnel news interactions must update from Firebase");
assert.ok(adminHtml.includes('id="adminNewsCommentRows"'), "Admin must have a live comment monitoring table");
assert.ok(admin.includes("renderAdminNewsInteractions") && admin.includes("data-delete-news-comment"), "Admin must monitor and moderate news comments");
assert.ok(admin.includes('db.ref("newsReactions").on("value"') && admin.includes('db.ref("newsComments").on("value"'), "Admin engagement data must be realtime");
assert.ok(rules.rules.newsReactions && rules.rules.newsComments, "Realtime Database rules must protect reactions and comments");
assert.ok(rules.rules.newsReactions["$newsId"]["$uid"][".write"].includes("auth.uid === $uid"), "Personnel may only write their own reaction");
assert.ok(rules.rules.newsComments["$newsId"]["$commentId"][".write"].includes("newData.child('uid').val() === auth.uid"), "Personnel may only create comments as themselves");
assert.ok(index.includes("1.0.671") && adminHtml.includes("1.0.671"), "Both panels must use version 1.0.671");
