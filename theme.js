(() => {
  "use strict";
  const KEY = "gsm-mobile-theme";
  const root = document.documentElement;
  const readSavedTheme = () => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "light" || saved === "dark") return saved;
    } catch (_) {}
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };
  const applyTheme = theme => {
    const normalized = theme === "dark" ? "dark" : "light";
    root.dataset.theme = normalized;
    root.style.colorScheme = normalized;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", normalized === "dark" ? "#171717" : "#e60000");
    const button = document.querySelector("[data-theme-toggle]");
    if (button) {
      button.textContent = normalized === "dark" ? "☀ Aydınlık tema" : "☾ Koyu tema";
      button.setAttribute("aria-label", normalized === "dark" ? "Aydınlık temaya geç" : "Karanlık temaya geç");
      button.setAttribute("aria-pressed", String(normalized === "dark"));
      button.title = normalized === "dark" ? "Aydınlık temaya geç" : "Karanlık temaya geç";
    }
  };
  applyTheme(readSavedTheme());
  const topbar = document.querySelector(".topbar");
  if (!topbar) return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "theme-toggle";
  button.dataset.themeToggle = "";
  button.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem(KEY, next); } catch (_) {}
    applyTheme(next);
  });
  const link = topbar.querySelector(".top-link");
  if (link) topbar.insertBefore(button, link);
  else topbar.append(button);
  applyTheme(root.dataset.theme);
})();