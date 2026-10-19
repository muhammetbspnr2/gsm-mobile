(() => {
  "use strict";
  const VERSION = "2.0.11";
  let installPrompt = null;
  const standalone = () => window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const panel = document.createElement("div");
  panel.className = "pwa-status";
  panel.id = "pwaStatus";
  panel.setAttribute("role", "status");
  panel.setAttribute("aria-live", "polite");
  panel.hidden = true;
  const dot = document.createElement("span");
  dot.className = "pwa-status-dot";
  dot.setAttribute("aria-hidden", "true");
  const label = document.createElement("span");
  label.className = "pwa-status-text";
  label.textContent = "GSM Takip v" + VERSION;
  const install = document.createElement("button");
  install.className = "pwa-install-btn";
  install.type = "button";
  install.textContent = "Uygulamayı yükle";
  install.hidden = true;
  panel.append(dot, label, install);
  document.body.append(panel);
  function renderStatus() {
    const offline = !navigator.onLine;
    panel.classList.toggle("is-offline", offline);
    if (offline) {
      label.textContent = "İnternet yok · Arayüz açılabilir, canlı kayıtlar için bağlantı gerekir.";
      panel.hidden = false;
    } else if (installPrompt && !standalone()) {
      label.textContent = "GSM Takip cihazınıza yüklenmeye hazır.";
      panel.hidden = false;
    } else panel.hidden = true;
    install.hidden = !installPrompt || standalone() || offline;
  }
  window.addEventListener("online", renderStatus);
  window.addEventListener("offline", renderStatus);
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    renderStatus();
  });
  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    renderStatus();
  });
  install.addEventListener("click", async () => {
    if (!installPrompt) return;
    const promptEvent = installPrompt;
    installPrompt = null;
    await promptEvent.prompt();
    renderStatus();
  });
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register(new URL("sw.js?v=" + VERSION, document.baseURI).href)
        .catch(error => console.warn("GSM Takip çevrimdışı desteği etkinleştirilemedi:", error));
    });
  }
  renderStatus();
})();
