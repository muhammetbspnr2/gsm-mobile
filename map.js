(() => {
  "use strict";
  const instances = new Map();
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const validCoords = site => {
    const latText = String(site.latitude ?? site.lat ?? "").trim().replace(",", ".");
    const lngText = String(site.longitude ?? site.lng ?? "").trim().replace(",", ".");
    if (!latText || !lngText) return null;
    const lat = Number(latText), lng = Number(lngText);
    return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 ? [lat, lng] : null;
  };
  const mapUrl = site => {
    const coords = validCoords(site);
    const target = coords ? coords[0] + "," + coords[1] : String(site.address || [site.district, site.province, "Türkiye"].filter(Boolean).join(", "));
    return "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(target);
  };
  function render(containerId, incoming, options) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const opts = options || {};
    let state = instances.get(containerId);
    if (!state) {
      state = { map: null, layer: null, sites: [], opts: opts, listenersReady: false };
      instances.set(containerId, state);
    }
    state.opts = opts;
    state.sites = (Array.isArray(incoming) ? incoming : Object.entries(incoming || {}).map(([key, site]) => Object.assign({_key:key}, site)))
      .filter(site => site && typeof site === "object")
      .map(site => Object.assign({}, site, {_mapKey:String(site._key || site.id || site.key || site.siteId || site.siteCode || "")}));
    if (!state.listenersReady) {
      const search = document.getElementById(opts.searchId);
      const operator = document.getElementById(opts.operatorId);
      const type = document.getElementById(opts.typeId);
      [search, operator, type].filter(Boolean).forEach(control => control.addEventListener("input", () => update(containerId)));
      [operator, type].filter(Boolean).forEach(control => control.addEventListener("change", () => update(containerId)));
      const missing = document.getElementById(opts.missingId);
      if (missing) missing.addEventListener("click", event => {
        const button = event.target.closest("[data-map-open]");
        if (!button) return;
        const site = state.sites.find(item => item._mapKey === button.dataset.mapOpen);
        if (site && typeof state.opts.onSelect === "function") state.opts.onSelect(site);
      });
      state.listenersReady = true;
    }
    if (!window.L) {
      container.innerHTML = '<div class="map-unavailable"><strong>Harita yüklenemedi</strong><span>Harita katmanı için internet bağlantısını kontrol edin. Saha listesi ve koordinat düzenleme kullanılmaya devam eder.</span></div>';
      update(containerId, true);
      return;
    }
    if (!state.map) {
      state.map = window.L.map(containerId, {scrollWheelZoom:false, preferCanvas:true}).setView([39.0, 35.0], 5);
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> katkıda bulunanlar'
      }).addTo(state.map);
      state.layer = window.L.featureGroup().addTo(state.map);
      setTimeout(() => state.map && state.map.invalidateSize(), 150);
    }
    update(containerId);
  }
  function update(containerId, mapUnavailable) {
    const state = instances.get(containerId);
    if (!state) return;
    const opts = state.opts;
    const search = String(document.getElementById(opts.searchId)?.value || "").trim().toLocaleLowerCase("tr-TR");
    const operator = String(document.getElementById(opts.operatorId)?.value || "");
    const type = String(document.getElementById(opts.typeId)?.value || "");
    const matches = state.sites.filter(site => {
      const haystack = [site.siteId, site.siteCode, site.siteNo, site.company, site.address, site.province, site.district, site.operator, site.siteType].filter(Boolean).join(" ").toLocaleLowerCase("tr-TR");
      return (!search || haystack.includes(search)) && (!operator || String(site.operator || "") === operator) && (!type || String(site.siteType || "") === type);
    });
    const mapped = matches.filter(site => validCoords(site));
    const missing = matches.filter(site => !validCoords(site));
    const summary = document.getElementById(opts.summaryId);
    if (summary) summary.textContent = mapped.length + " haritada · " + missing.length + " koordinat eksik/geçersiz · " + matches.length + " sonuç";
    const missingHost = document.getElementById(opts.missingId);
    if (missingHost) missingHost.innerHTML = missing.slice(0, 30).map(site =>
      '<button class="map-missing-item" type="button" data-map-open="' + esc(site._mapKey) + '"><span><b>' + esc(site.siteId || site.siteCode || "Saha") + '</b><small>' + esc([site.siteNo ? "No " + site.siteNo : "", site.province, site.district, site.address].filter(Boolean).join(" · ") || "Adres bilgisi yok") + '</small></span><span>Detay ↗</span></button>'
    ).join("") || '<p class="map-empty-note">Filtreye uygun koordinatsız saha yok.</p>';
    if (missingHost && missing.length > 30) missingHost.insertAdjacentHTML("beforeend", '<p class="map-empty-note">İlk 30 kayıt gösteriliyor. Aramayı daraltın.</p>');
    if (mapUnavailable || !state.map || !state.layer) return;
    state.layer.clearLayers();
    mapped.forEach(site => {
      const coords = validCoords(site);
      const marker = window.L.circleMarker(coords, {radius:7, weight:2, color:"#101b2d", fillColor:"#f2c43d", fillOpacity:0.96});
      const title = site.siteId || site.siteCode || "Saha";
      const detail = [site.siteNo ? "Saha No: " + site.siteNo : "", site.operator, site.siteType, [site.district, site.province].filter(Boolean).join(" / ")].filter(Boolean).join(" · ");
      marker.bindPopup('<div class="map-popup"><strong>' + esc(title) + '</strong><span>' + esc(detail || "Saha kaydı") + '</span><small>' + esc(site.address || "Adres belirtilmemiş") + '</small><button type="button" data-map-open="' + esc(site._mapKey) + '">Saha detayını aç</button><a href="' + esc(mapUrl(site)) + '" target="_blank" rel="noopener noreferrer">Google Maps ile git ↗</a></div>');
      marker.on("popupopen", event => {
        const button = event.popup.getElement()?.querySelector("[data-map-open]");
        if (button) button.onclick = () => {
          if (typeof state.opts.onSelect === "function") state.opts.onSelect(site);
        };
      });
      marker.addTo(state.layer);
    });
    if (mapped.length) {
      const bounds = state.layer.getBounds();
      state.map.fitBounds(bounds, {padding:[28,28], maxZoom:13});
      if (mapped.length === 1) state.map.setZoom(Math.max(state.map.getZoom(), 12));
    } else {
      state.map.setView([39.0, 35.0], 5);
    }
    setTimeout(() => state.map && state.map.invalidateSize(), 80);
  }
  window.GSMMap = {render};
})();