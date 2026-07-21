/** CrawlJudge — robots + basic ToS signals for agent scrape safety */
export async function judgeUrl(rawUrl) {
  const url = new URL(rawUrl);
  const origin = url.origin;
  const robotsUrl = `${origin}/robots.txt`;
  const out = {
    url: rawUrl,
    origin,
    verdict: "careful",
    risk_score: 50,
    robots: { found: false, allows: true, crawl_delay: null, disallows: [], raw_snippet: "" },
    sitemap_url: null,
    tos_flags: [],
    rationale: [],
  };

  // robots
  try {
    const r = await fetch(robotsUrl, {
      headers: { "User-Agent": "MoneyMachine-CrawlJudge/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (r.ok) {
      const text = await r.text();
      out.robots.found = true;
      out.robots.raw_snippet = text.slice(0, 500);
      const lines = text.split(/\r?\n/);
      let applies = false;
      for (const line of lines) {
        const l = line.trim();
        if (/^user-agent:\s*\*/i.test(l)) applies = true;
        else if (/^user-agent:/i.test(l)) applies = false;
        if (!applies && !/^user-agent:\s*\*/i.test(l)) continue;
        const dm = l.match(/^disallow:\s*(.*)/i);
        if (dm) {
          const path = (dm[1] || "").trim();
          if (path) out.robots.disallows.push(path);
          if (path === "/") out.robots.allows = false;
        }
        const cm = l.match(/^crawl-delay:\s*([\d.]+)/i);
        if (cm) out.robots.crawl_delay = Number(cm[1]);
        const sm = l.match(/^sitemap:\s*(.+)/i);
        if (sm) out.sitemap_url = sm[1].trim();
      }
      // path-specific
      const path = url.pathname || "/";
      for (const d of out.robots.disallows) {
        if (d !== "/" && path.startsWith(d)) {
          out.robots.allows = false;
          out.rationale.push(`robots Disallow matches path: ${d}`);
        }
      }
      if (!out.robots.allows) out.rationale.push("robots.txt disallows crawling");
      else out.rationale.push("robots.txt allows (default * rules checked)");
    } else {
      out.rationale.push(`robots.txt not found (${r.status}) — treat carefully`);
    }
  } catch (e) {
    out.rationale.push(`robots fetch failed: ${e.message}`);
  }

  // light homepage/tos scan
  try {
    const r = await fetch(origin, {
      headers: { "User-Agent": "MoneyMachine-CrawlJudge/1.0" },
      signal: AbortSignal.timeout(12000),
    });
    if (r.ok) {
      const html = (await r.text()).slice(0, 200000).toLowerCase();
      const phrases = [
        ["no bots", 25],
        ["no scrap", 25],
        ["automated access", 15],
        ["crawling", 10],
        ["data mining", 15],
        ["robots not allowed", 30],
      ];
      for (const [p, score] of phrases) {
        if (html.includes(p)) {
          out.tos_flags.push(p);
          out.risk_score = Math.min(100, out.risk_score + score);
        }
      }
    }
  } catch {
    /* ignore */
  }

  if (!out.robots.allows) {
    out.verdict = "deny";
    out.risk_score = Math.max(out.risk_score, 85);
  } else if (out.tos_flags.length >= 2 || out.risk_score >= 70) {
    out.verdict = "careful";
  } else if (out.robots.found && out.tos_flags.length === 0) {
    out.verdict = "allow";
    out.risk_score = Math.min(out.risk_score, 35);
  }

  out.rationale.push(`verdict=${out.verdict} risk=${out.risk_score}`);
  return out;
}
