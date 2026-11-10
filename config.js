/*
 * Menu Bar Overlay — configuration
 * ---------------------------------
 * Edit the values below, then reload the extension at chrome://extensions
 * and refresh any open page to see your changes.
 *
 * This file runs as a plain content script (no ES modules), so it exposes a
 * single global object that content.js reads.
 */
window.__MENUBAR_CONFIG__ = {
  // Master on/off switch. Set to false to disable the overlay everywhere.
  enabled: true,

  // When true, the bar is pinned and always visible (no hover needed).
  // When false, it stays hidden and slides down only when the pointer
  // reaches the top edge of the page.
  alwaysVisible: true,

  // The bold "active app" name shown right after the Apple logo.
  appName: "Chrome",

  // The menu titles shown after the app name. Purely cosmetic (no dropdowns).
  menus: ["File", "Edit", "View", "History", "Bookmarks", "Window", "Help"],

  // Right-side status icons. Each is a key into the ICONS map at the bottom.
  // Remove or reorder as you like. Available: "battery", "wifi", "search", "control".
  rightIcons: ["battery", "wifi", "search", "control"],

  // Live clock on the far right.
  showClock: true,
  clock: {
    // BCP-47 locale used for formatting (e.g. "en-US", "en-GB", "de-DE").
    locale: "en-US",
    // Intl.DateTimeFormat options. Default renders like "Mon 9:41 AM".
    format: {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }
  },

  // Bar height in pixels (macOS menu bar is ~24–30px).
  barHeight: 28,

  // How close to the top edge (in px) the pointer must get to reveal the bar.
  triggerHeight: 8,

  // Inline SVG markup for each icon. Uses currentColor so icons follow the
  // light/dark theme automatically. Replace these if you want different glyphs.
  ICONS: {
    battery:
      '<svg viewBox="0 0 28 14" width="24" height="12" fill="none" aria-hidden="true"><rect x="0.5" y="1.5" width="23" height="11" rx="3" stroke="currentColor" stroke-opacity="0.5"/><rect x="2.5" y="3.5" width="17" height="7" rx="1.5" fill="currentColor"/><path d="M25 5c1.2.3 1.2 4 0 4.3V5z" fill="currentColor" fill-opacity="0.5"/></svg>',
    wifi:
      '<svg viewBox="0 0 20 15" width="16" height="12" fill="currentColor" aria-hidden="true"><path d="M10 14.2a1.3 1.3 0 100-2.6 1.3 1.3 0 000 2.6z"/><path d="M10 7.3c1.8 0 3.5.7 4.7 1.9l1.5-1.6A9 9 0 0010 6a9 9 0 00-6.2 1.6l1.5 1.6A6.5 6.5 0 0110 7.3z"/><path d="M10 2.2c3.2 0 6.1 1.2 8.3 3.3l1.6-1.7A13.6 13.6 0 0010 0 13.6 13.6 0 00.1 3.8l1.6 1.7A11.6 11.6 0 0110 2.2z"/></svg>',
    search:
      '<svg viewBox="0 0 18 18" width="14" height="14" fill="none" aria-hidden="true"><circle cx="7.5" cy="7.5" r="5" stroke="currentColor" stroke-width="1.6"/><path d="M11.5 11.5L16 16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    control:
      '<svg viewBox="0 0 24 16" width="19" height="13" fill="none" aria-hidden="true"><rect x="2" y="3.5" width="9" height="2.2" rx="1.1" fill="currentColor"/><rect x="2" y="10.3" width="9" height="2.2" rx="1.1" fill="currentColor"/><rect x="13" y="3.5" width="9" height="2.2" rx="1.1" fill="currentColor" fill-opacity="0.4"/><rect x="13" y="10.3" width="9" height="2.2" rx="1.1" fill="currentColor" fill-opacity="0.4"/><circle cx="8" cy="4.6" r="2.2" fill="currentColor"/><circle cx="16" cy="11.4" r="2.2" fill="currentColor"/></svg>',
    apple:
      '<svg viewBox="0 0 14 17" width="13" height="16" fill="currentColor" aria-hidden="true"><path d="M11.3 9c0-1.9 1.5-2.8 1.6-2.9-0.9-1.3-2.3-1.5-2.8-1.5-1.2-.1-2.3.7-2.9.7-.6 0-1.5-.7-2.5-.7C3.4 4.6 2.2 5.4 1.6 6.6c-1.4 2.4-.4 6 1 8 .7.9 1.5 2 2.5 1.9 1-.04 1.4-.6 2.6-.6s1.5.6 2.6.6c1.1-.02 1.7-.9 2.4-1.9.5-.7.8-1.4 1-2.2-.02-.01-1.8-.7-1.8-2.9z"/><path d="M9.3 3.1c.5-.6.9-1.5.8-2.4-.8.03-1.7.5-2.2 1.2-.5.6-.9 1.5-.8 2.3.9.07 1.7-.4 2.2-1.1z"/></svg>'
  }
};
