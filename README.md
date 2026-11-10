# Menu Bar Overlay

A small Chrome extension (Manifest V3) that injects a **cosmetic** macOS-style
menu bar at the top of webpages. By default the bar is always visible, pinned to
the top of the page content. Set `alwaysVisible: false` in `config.js` to switch
to hover-reveal mode, where it stays hidden until the pointer reaches the top
edge. Handy for theming, UI demos, mockups, and screenshots.

It is purely visual — the menus don't open and nothing is clickable.

## Install (load unpacked)

1. Open `chrome://extensions`.
2. Turn on **Developer mode** (top-right).
3. Click **Load unpacked** and select this folder (`chromeXtend`).
4. Open any normal website and move your mouse to the very top of the page.

After editing files, click the **reload** icon on the extension card and refresh
the page.

## Customize

All settings live in [`config.js`](./config.js). Edit the object, reload the
extension, and refresh the page. Options include:

- `enabled` — master on/off switch.
- `alwaysVisible` — `true` pins the bar so it's always shown; `false` hides it
  until the pointer reaches the top edge (hover-reveal).
- `appName` — the bold active-app name after the Apple logo.
- `menus` — the menu titles (`File`, `Edit`, …).
- `rightIcons` — which status icons to show (`battery`, `wifi`, `search`, `control`).
- `showClock` / `clock` — show a live clock and set its locale + format
  (default renders like `Mon 9:41 AM`).
- `barHeight` — bar height in px.
- `triggerHeight` — how close to the top edge (px) the pointer must get to reveal
  the bar.
- `ICONS` — the inline SVG for each icon; they use `currentColor`, so they adapt
  to light/dark automatically. Replace these to use different glyphs.

## Appearance

The bar follows the system/page color scheme (`prefers-color-scheme`): a
translucent light style by default, and a translucent dark style in dark mode.

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | MV3 manifest; injects the content script on all pages (top frame only). No permissions requested. |
| `config.js` | Editable settings and icon SVGs. |
| `content.js` | Builds the bar, the live clock, and the pointer-reveal logic. |
| `style.css` | Positioning, slide transition, light/dark theming. |
| `icons/` | Extension icons (plain placeholders — replace with your own). |

## Known limitations

- A page extension can only draw **inside the webpage area**. It cannot draw over
  Chrome's tabs/address bar or the real macOS menu bar at the top of the screen.
- The content script does not run on `chrome://` pages, the Chrome Web Store, or
  (unless you enable it) local `file://` pages — a Chrome restriction.
- It only renders in the top frame, so it won't appear inside embedded iframes.
- Sites with their own fixed top bars may sit under the revealed bar, but since
  it only shows on hover it doesn't permanently cover them.
- This is a cosmetic tool. It is **not** intended for, and is not reliable at,
  defeating exam proctoring or screen-capture monitoring.
