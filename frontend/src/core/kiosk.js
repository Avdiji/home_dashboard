// Kiosk hardening: the touchscreen has no mouse, so the browser's long-press
// context menu (Back/Reload/View Source/Inspect) is unwanted UI surface, not
// a feature — disable it app-wide. Imported for its side effect in main.jsx.
document.addEventListener("contextmenu", (e) => e.preventDefault());
