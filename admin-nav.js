(() => {
 "use strict";
 const nav = document.querySelector("#adminAppView .admin-sidebar");
 if (!nav) return;
 const groups = [...nav.querySelectorAll(".admin-nav-group")];
 const isNarrow = () => window.matchMedia("(max-width: 900px)").matches;\n const syncViewport = () => { groups.forEach(group => { if (isNarrow()) setExpanded(group, false); }); };
 const setExpanded = (group, expanded) => {
   const trigger = group.querySelector("[data-nav-toggle]");
   const items = group.querySelector(".admin-nav-items");
   if (!trigger || !items) return;
   group.classList.toggle("is-collapsed", !expanded);
   trigger.setAttribute("aria-expanded", String(expanded));
   items.hidden = !expanded;
 };
 groups.forEach(group => {
   const trigger = group.querySelector("[data-nav-toggle]");
   if (!trigger) return;
   setExpanded(group, !isNarrow());
   trigger.addEventListener("click", () => setExpanded(group, trigger.getAttribute("aria-expanded") !== "true"));
   group.addEventListener("mouseenter", () => { if (!isNarrow()) setExpanded(group, true); });
   group.addEventListener("mouseleave", () => { if (!isNarrow()) setExpanded(group, false); });
   group.addEventListener("focusin", () => { if (!isNarrow()) setExpanded(group, true); });
   group.addEventListener("focusout", event => {
     if (!isNarrow() && !group.contains(event.relatedTarget)) setExpanded(group, false);
   });
 });
 window.addEventListener("resize", syncViewport, { passive: true });
})();