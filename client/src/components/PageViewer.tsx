"use client";

import { useEffect, useMemo, useRef } from "react";
import { isValidAddress, normalizeAddress } from "@/lib/address";
import type { Site } from "@/lib/types";

type FrameMessage =
  | { type: "navigate"; address: string }
  | { type: "scroll"; y: number };

function isFrameMessage(value: unknown): value is FrameMessage {
  if (typeof value !== "object" || value === null || !("type" in value)) {
    return false;
  }
  if (value.type === "navigate") {
    return "address" in value && typeof value.address === "string";
  }
  return (
    value.type === "scroll" &&
    "y" in value &&
    typeof value.y === "number" &&
    Number.isFinite(value.y)
  );
}

export function PageViewer({
  site,
  scrollY,
  onNavigate,
  onScroll,
}: {
  site: Site;
  scrollY: number;
  onNavigate: (address: string) => void;
  onScroll: (y: number) => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const nonce = useMemo(() => crypto.randomUUID(), []);
  // This CSP prevents author scripts, network loads, and other unapproved resources from running.
  const csp = `default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'`;
  const srcDoc = useMemo(
    () => `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="${csp}"></head><body>${site.body}<script nonce="${nonce}">
(() => {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest("a[href]");
    if (!anchor) return;
    event.preventDefault();
    parent.postMessage({ type: "navigate", address: anchor.getAttribute("href") || "" }, "*");
  });
  let frame = 0;
  window.addEventListener("scroll", () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      parent.postMessage({ type: "scroll", y: window.scrollY }, "*");
    });
  }, { passive: true });
  window.addEventListener("message", (event) => {
    if (event.source !== parent || !event.data || typeof event.data !== "object") return;
    const message = event.data;
    if (message.type === "restore" && typeof message.y === "number" && Number.isFinite(message.y)) {
      window.scrollTo(0, Math.max(0, message.y));
    }
  });
})();
</script></body></html>`,
    [csp, nonce, site.body],
  );

  useEffect(() => {
    function receive(event: MessageEvent<unknown>) {
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (!isFrameMessage(event.data)) return;
      if (event.data.type === "scroll") {
        onScroll(Math.max(0, event.data.y));
        return;
      }
      const address = normalizeAddress(event.data.address);
      if (isValidAddress(address)) onNavigate(address);
    }
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [onNavigate, onScroll]);

  function restoreScroll() {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "restore", y: Math.max(0, scrollY) },
      "*",
    );
  }

  return (
    <iframe
      ref={iframeRef}
      title={site.title}
      srcDoc={srcDoc}
      // This sandbox prevents the page from accessing the app origin or navigating the top-level browser.
      sandbox="allow-scripts"
      className="site-frame"
      onLoad={restoreScroll}
    />
  );
}
