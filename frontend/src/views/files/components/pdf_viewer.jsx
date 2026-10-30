import { useEffect, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import classes from "./pdf_viewer.module.css";

GlobalWorkerOptions.workerSrc = workerUrl;

// Renders every page of a PDF into canvases with pdf.js. Used instead of an
// <iframe> because Android Chrome / the Capacitor WebView have no built-in PDF
// viewer (blank frame / download prompt) and iOS Safari only shows page one.
// Pages are drawn at the container's width × devicePixelRatio so text stays
// sharp. Range/stream loading is off: the cross-origin API (APK) would need a
// CORS preflight for Range, so the file is fetched in one plain GET.
export default function PdfViewer({ src, fallback }) {
  const containerRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const task = getDocument({ url: src, disableRange: true, disableStream: true });
    let cancelled = false;

    (async () => {
      const pdf = await task.promise;
      const width = container.clientWidth;
      const dpr = window.devicePixelRatio || 1;
      for (let n = 1; n <= pdf.numPages && !cancelled; n++) {
        const page = await pdf.getPage(n);
        const viewport = page.getViewport({ scale: width / page.getViewport({ scale: 1 }).width });
        const canvas = document.createElement("canvas");
        canvas.className = classes.page;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        container.appendChild(canvas);
        await page.render({ canvas, viewport, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined }).promise;
      }
    })().catch(() => !cancelled && setFailed(true));

    return () => {
      cancelled = true;
      task.destroy();
      container.replaceChildren();
    };
  }, [src]);

  if (failed) return fallback;
  return <div ref={containerRef} className={classes.pages} />;
}
