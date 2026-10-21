/* GSM Mobile operator-scoped site directory. Site copies under operatorSites are a queryable access index; sites/{id} remains the canonical admin record. */
(() => {
  "use strict";
  const normalize = value => String(value || "").trim().toLocaleLowerCase("tr-TR");
  const profileOperatorIds = profile => {
    const ids = new Set();
    if (profile && profile.operatorId) ids.add(String(profile.operatorId));
    Object.entries((profile && profile.operatorIds) || {}).forEach(([id, enabled]) => {
      if (enabled === true) ids.add(String(id));
    });
    return Array.from(ids);
  };
  async function resolveOperatorId(db, operatorName) {
    const target = normalize(operatorName);
    if (!target) return "";
    const snap = await db.ref("operators").once("value");
    const operators = snap.val() || {};
    const found = Object.entries(operators).find(([, value]) => value && normalize(value.name) === target);
    return found ? found[0] : "";
  }
  async function resolveCompanyId(db, companyName) {
    const target = normalize(companyName);
    if (!target) return "";
    const snap = await db.ref("companies").once("value");
    const companies = snap.val() || {};
    const found = Object.entries(companies).find(([, value]) => value && normalize(value.name) === target);
    return found ? found[0] : "";
  }
  async function syncIndex(db, siteKey, site, previousOperatorId) {
    if (!siteKey || !site || typeof site !== "object") throw new Error("Saha indeksi için saha anahtarı ve kayıt zorunludur.");
    const operatorId = String(site.operatorId || await resolveOperatorId(db, site.operator) || "");
    if (!operatorId) throw new Error("Bu sahanın operatörü kayıtlı değil. Önce Yönetici > Operatörler bölümünden operatörü tanımlayın.");
    const indexed = { ...site, id: site.id || siteKey, operatorId };
    const updates = {};
    if (previousOperatorId && String(previousOperatorId) !== operatorId) {
      updates["operatorSites/" + previousOperatorId + "/" + siteKey] = null;
    }
    updates["operatorSites/" + operatorId + "/" + siteKey] = indexed;
    await db.ref().update(updates);
    return indexed;
  }
  function subscribe(db, profile, onChange, onError) {
    const ids = profileOperatorIds(profile);
    const listeners = [];
    const snapshots = new Map();
    let closed = false;
    const publish = () => {
      if (closed) return;
      const merged = {};
      snapshots.forEach(items => Object.entries(items || {}).forEach(([key, site]) => {
        if (site && site.approved === true) merged[key] = { ...site, _key: key };
      }));
      onChange(merged, ids);
    };
    if (!ids.length) {
      onChange({}, ids);
      return { off() { closed = true; } };
    }
    ids.forEach(operatorId => {
      const ref = db.ref("operatorSites/" + operatorId).orderByChild("approved").equalTo(true);
      const listener = ref.on("value", snap => {
        snapshots.set(operatorId, snap.val() || {});
        publish();
      }, err => { if (!closed && onError) onError(err, operatorId); });
      listeners.push({ ref, listener });
    });
    return { off() { closed = true; listeners.forEach(({ ref, listener }) => ref.off("value", listener)); } };
  }
  window.GSMTenantSites = { profileOperatorIds, resolveOperatorId, resolveCompanyId, syncIndex, subscribe };
})();