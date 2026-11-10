/*
 * Menu Bar Overlay — content script
 * ----------------------------------
 * Builds a cosmetic macOS-style menu bar, hidden off-screen at the top of the
 * page and revealed when the pointer reaches the top edge. Reveal is handled in
 * JS (no invisible overlay div) so the bar never swallows clicks on the host
 * page when it is tucked away.
 */
(function () {
  "use strict";

  // Only run in the top-level frame.
  if (window.top !== window) return;

  // Don't inject twice (e.g. if the script is evaluated more than once).
  if (document.getElementById("fake-mac-menubar")) return;

  var cfg = window.__MENUBAR_CONFIG__;
  if (!cfg || cfg.enabled === false) return;

  var BAR_HEIGHT = typeof cfg.barHeight === "number" ? cfg.barHeight : 28;
  var TRIGGER_HEIGHT =
    typeof cfg.triggerHeight === "number" ? cfg.triggerHeight : 8;
  var ICONS = cfg.ICONS || {};

  // --- Build the bar -------------------------------------------------------
  var bar = document.createElement("div");
  bar.id = "fake-mac-menubar";
  bar.style.height = BAR_HEIGHT + "px";
  bar.style.top = "-" + (BAR_HEIGHT + 4) + "px";

  // Left cluster: Apple logo + bold app name + menu titles.
  var left = document.createElement("div");
  left.className = "mb-left";

  var apple = document.createElement("span");
  apple.className = "mb-apple";
  apple.innerHTML = ICONS.apple || "";
  left.appendChild(apple);

  if (cfg.appName) {
    var app = document.createElement("span");
    app.className = "mb-app";
    app.textContent = cfg.appName;
    left.appendChild(app);
  }

  (cfg.menus || []).forEach(function (label) {
    var m = document.createElement("span");
    m.className = "mb-menu";
    m.textContent = label;
    left.appendChild(m);
  });

  // Right cluster: status icons + clock.
  var right = document.createElement("div");
  right.className = "mb-right";

  (cfg.rightIcons || []).forEach(function (key) {
    if (!ICONS[key]) return;
    var ic = document.createElement("span");
    ic.className = "mb-icon";
    ic.innerHTML = ICONS[key];
    right.appendChild(ic);
  });

  var clockEl = null;
  if (cfg.showClock) {
    clockEl = document.createElement("span");
    clockEl.className = "mb-clock";
    right.appendChild(clockEl);
  }

  bar.appendChild(left);
  bar.appendChild(right);
  document.documentElement.appendChild(bar);

  // --- Live clock ----------------------------------------------------------
  var clockTimer = null;
  function renderClock() {
    if (!clockEl) return;
    var opts = (cfg.clock && cfg.clock.format) || {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    };
    var locale = (cfg.clock && cfg.clock.locale) || undefined;
    try {
      clockEl.textContent = new Date().toLocaleString(locale, opts);
    } catch (e) {
      clockEl.textContent = new Date().toLocaleTimeString();
    }
  }
  if (clockEl) {
    renderClock();
    clockTimer = setInterval(renderClock, 1000);
  }

  // --- Always-visible mode -------------------------------------------------
  // If configured, pin the bar open and skip the hover logic entirely.
  if (cfg.alwaysVisible) {
    bar.classList.add("visible");
    window.addEventListener(
      "pagehide",
      function () {
        if (clockTimer) clearInterval(clockTimer);
      },
      { once: true }
    );
    return;
  }

  // --- Reveal on pointer near top edge ------------------------------------
  var visible = false;
  var ticking = false;
  var lastY = Infinity;

  function apply() {
    ticking = false;
    // Reveal when near the top; hide once the pointer drops below the bar.
    if (!visible && lastY <= TRIGGER_HEIGHT) {
      visible = true;
      bar.classList.add("visible");
    } else if (visible && lastY > BAR_HEIGHT) {
      visible = false;
      bar.classList.remove("visible");
    }
  }

  function onMove(e) {
    lastY = e.clientY;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(apply);
    }
  }

  document.addEventListener("mousemove", onMove, { passive: true });

  // --- Teardown ------------------------------------------------------------
  window.addEventListener(
    "pagehide",
    function () {
      if (clockTimer) clearInterval(clockTimer);
      document.removeEventListener("mousemove", onMove);
    },
    { once: true }
  );
})();
