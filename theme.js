/* GSM Mobile uses one permanent light theme. Theme switching and OS theme detection are disabled. */
(() => {
  "use strict";
  const root = document.documentElement;
  root.dataset.theme = "light";
  root.style.colorScheme = "light";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", "#e60000");
  document.querySelectorAll("[data-theme-toggle],.theme-toggle").forEach(el => el.remove());
})();