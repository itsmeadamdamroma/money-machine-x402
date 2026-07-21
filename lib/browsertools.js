/** Playwright-based: vitals (light lighthouse) + axe-lite a11y */
import { chromium } from "playwright";

async function withPage(url, fn, { timeout = 35000 } = {}) {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const t0 = Date.now();
    const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout });
    const status = resp?.status() || 0;
    const result = await fn(page, { status, load_ms: Date.now() - t0 });
    return result;
  } finally {
    await browser.close();
  }
}

/** LightHouse-lite: performance-ish metrics without full Lighthouse dep */
export async function lightPack(url, strategy = "mobile") {
  return withPage(url, async (page, meta) => {
    if (strategy === "mobile") {
      await page.setViewportSize({ width: 390, height: 844 });
    } else {
      await page.setViewportSize({ width: 1365, height: 900 });
    }
    // wait a bit for network
    await page.waitForTimeout(1500);
    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0];
      const paints = performance.getEntriesByType("paint");
      const fcp = paints.find((p) => p.name === "first-contentful-paint");
      const resources = performance.getEntriesByType("resource");
      return {
        dom_content_loaded_ms: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
        load_event_ms: nav ? Math.round(nav.loadEventEnd) : null,
        ttfb_ms: nav ? Math.round(nav.responseStart) : null,
        fcp_ms: fcp ? Math.round(fcp.startTime) : null,
        resource_count: resources.length,
        transfer_size_est: resources.reduce((a, r) => a + (r.transferSize || 0), 0),
      };
    });
    const title = await page.title();
    // crude scores 0-100
    const fcp = metrics.fcp_ms || 4000;
    const perf = Math.max(0, Math.min(100, Math.round(100 - fcp / 50)));
    const weight = metrics.transfer_size_est || 0;
    const weight_score = Math.max(0, Math.min(100, Math.round(100 - weight / 50000)));
    return {
      url,
      strategy,
      title,
      http_status: meta.status,
      metrics,
      scores: {
        performance_proxy: perf,
        weight_proxy: weight_score,
        overall_proxy: Math.round((perf + weight_score) / 2),
      },
      top_opportunities: [
        fcp > 2500 ? "Improve First Contentful Paint (slow FCP)" : null,
        weight > 1_500_000 ? "Reduce total transfer size" : null,
        metrics.resource_count > 80 ? "Too many network requests" : null,
      ].filter(Boolean),
      note: "LightHouse-lite (Playwright performance API). Not Google Lighthouse CLI.",
    };
  });
}

/** Axe-lite: structural a11y checks without axe package */
export async function axeLite(url) {
  return withPage(url, async (page, meta) => {
    await page.waitForTimeout(800);
    const findings = await page.evaluate(() => {
      const issues = [];
      const imgs = [...document.querySelectorAll("img")];
      const noAlt = imgs.filter((i) => !i.getAttribute("alt") && !i.getAttribute("aria-label"));
      if (noAlt.length)
        issues.push({
          id: "image-alt",
          impact: "serious",
          help: "Images must have alt text",
          count: noAlt.length,
          nodes: noAlt.slice(0, 5).map((i) => ({ target: i.src?.slice(0, 120), html: i.outerHTML.slice(0, 120) })),
        });
      const inputs = [...document.querySelectorAll("input,select,textarea")].filter(
        (el) => el.type !== "hidden",
      );
      const unlabeled = inputs.filter((el) => {
        const id = el.id;
        if (id && document.querySelector(`label[for="${id}"]`)) return false;
        if (el.getAttribute("aria-label") || el.getAttribute("aria-labelledby")) return false;
        if (el.closest("label")) return false;
        return true;
      });
      if (unlabeled.length)
        issues.push({
          id: "label",
          impact: "serious",
          help: "Form controls should have labels",
          count: unlabeled.length,
          nodes: unlabeled.slice(0, 5).map((el) => ({
            target: el.name || el.id || el.type,
            html: el.outerHTML.slice(0, 120),
          })),
        });
      const htmlLang = document.documentElement.getAttribute("lang");
      if (!htmlLang)
        issues.push({
          id: "html-lang",
          impact: "moderate",
          help: "html element should have lang attribute",
          count: 1,
          nodes: [{ target: "html", html: "<html>" }],
        });
      const buttons = [...document.querySelectorAll("button,a")].filter((el) => {
        const t = (el.innerText || el.getAttribute("aria-label") || "").trim();
        return t.length === 0 && el.tagName === "BUTTON";
      });
      if (buttons.length)
        issues.push({
          id: "button-name",
          impact: "critical",
          help: "Buttons must have accessible names",
          count: buttons.length,
          nodes: buttons.slice(0, 5).map((b) => ({ target: "button", html: b.outerHTML.slice(0, 100) })),
        });
      return issues;
    });
    const score = Math.max(0, 100 - findings.reduce((a, f) => a + f.count * 5, 0));
    return {
      url,
      http_status: meta.status,
      violations: findings,
      score_proxy: score,
      note: "Axe-lite heuristic checks (not full axe-core). Public pages only.",
    };
  });
}
