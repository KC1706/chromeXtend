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

  var wifiIconEl = null;
  (cfg.rightIcons || []).forEach(function (key) {
    if (!ICONS[key]) return;
    var ic = document.createElement("span");
    ic.className = "mb-icon";
    ic.innerHTML = ICONS[key];
    if (key === "wifi") {
      ic.classList.add("mb-wifi");
      wifiIconEl = ic;
    }
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

  // --- Wi-Fi dropdown ------------------------------------------------------
  // Clicking the Wi-Fi icon opens a cosmetic macOS-style network picker.
  var wifiPanel = null; // referenced below so hover-mode never hides the bar
                        // while the panel is open.

  if (wifiIconEl && cfg.wifi) {
    var wcfg = cfg.wifi;
    var wifiOn = wcfg.on !== false;
    var connected = wcfg.connected || null;
    var networks = wcfg.networks || [];

    function buildWifiPanel() {
      var panel = document.createElement("div");
      panel.className = "mb-dropdown mb-wifi-dropdown";
      panel.setAttribute("role", "menu");

      var head = document.createElement("div");
      head.className = "mb-dd-head";
      var title = document.createElement("span");
      title.className = "mb-dd-title";
      title.textContent = "Wi-Fi";
      var toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "mb-switch";
      toggle.setAttribute("aria-label", "Wi-Fi on/off");
      head.appendChild(title);
      head.appendChild(toggle);
      panel.appendChild(head);

      var sep = document.createElement("div");
      sep.className = "mb-dd-sep";
      panel.appendChild(sep);

      var list = document.createElement("div");
      list.className = "mb-dd-list";
      panel.appendChild(list);

      function renderToggle() {
        toggle.classList.toggle("on", wifiOn);
        toggle.setAttribute("aria-pressed", wifiOn ? "true" : "false");
      }

      function renderList() {
        list.innerHTML = "";
        if (!wifiOn) {
          var off = document.createElement("div");
          off.className = "mb-dd-empty";
          off.textContent = "Wi-Fi is off";
          list.appendChild(off);
          return;
        }
        networks.forEach(function (name) {
          var row = document.createElement("button");
          row.type = "button";
          row.className = "mb-dd-item";
          if (name === connected) row.classList.add("connected");

          var check = document.createElement("span");
          check.className = "mb-dd-check";
          check.innerHTML = name === connected ? ICONS.check || "" : "";

          var nm = document.createElement("span");
          nm.className = "mb-dd-name";
          nm.textContent = name;

          var status = document.createElement("span");
          status.className = "mb-dd-status";
          status.textContent = name === connected ? "Connected" : "";

          var lock = document.createElement("span");
          lock.className = "mb-dd-lock";
          lock.innerHTML = ICONS.lock || "";

          row.appendChild(check);
          row.appendChild(nm);
          row.appendChild(status);
          row.appendChild(lock);

          // Clicking a network switches the "connected" one (cosmetic only).
          row.addEventListener("click", function (e) {
            e.stopPropagation();
            connected = name;
            renderList();
          });
          list.appendChild(row);
        });
      }

      toggle.addEventListener("click", function (e) {
        e.stopPropagation();
        wifiOn = !wifiOn;
        renderToggle();
        renderList();
      });

      renderToggle();
      renderList();
      return panel;
    }

    function positionWifiPanel() {
      if (!wifiPanel) return;
      var r = wifiIconEl.getBoundingClientRect();
      wifiPanel.style.top = BAR_HEIGHT + 2 + "px";
      // Align the panel's right edge roughly under the icon.
      var fromRight = window.innerWidth - r.right - 6;
      wifiPanel.style.right = Math.max(6, fromRight) + "px";
    }

    function onDocClick(e) {
      if (
        wifiPanel &&
        !wifiPanel.contains(e.target) &&
        !wifiIconEl.contains(e.target)
      ) {
        closeWifi();
      }
    }

    function openWifi() {
      if (wifiPanel) return;
      wifiPanel = buildWifiPanel();
      document.documentElement.appendChild(wifiPanel);
      positionWifiPanel();
      wifiIconEl.classList.add("active");
      document.addEventListener("click", onDocClick, true);
      window.addEventListener("resize", positionWifiPanel);
    }

    function closeWifi() {
      if (!wifiPanel) return;
      wifiPanel.remove();
      wifiPanel = null;
      wifiIconEl.classList.remove("active");
      document.removeEventListener("click", onDocClick, true);
      window.removeEventListener("resize", positionWifiPanel);
    }

    wifiIconEl.addEventListener("click", function (e) {
      e.stopPropagation();
      if (wifiPanel) closeWifi();
      else openWifi();
    });
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
    } else if (visible && lastY > BAR_HEIGHT && !wifiPanel) {
      // Keep the bar open while the Wi-Fi dropdown is showing.
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
