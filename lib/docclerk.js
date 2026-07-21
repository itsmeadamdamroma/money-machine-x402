/** DocClerk-lite — public PDF URL → structured fields */
import { PDFParse } from "pdf-parse";

function extractFields(text) {
  const clean = text.replace(/\s+/g, " ").trim();
  const money = [...clean.matchAll(/(?:USD|EUR|GBP|\$|€|£)\s?([\d,]+\.?\d{0,2})/gi)].map(
    (m) => m[0],
  );
  const dates = [...clean.matchAll(/\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d{4}-\d{2}-\d{2})\b/g)].map(
    (m) => m[1],
  );
  const emails = [...clean.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)].map((m) => m[0]);
  const invoices = [...clean.matchAll(/(?:invoice|inv|receipt|order)\s*[#:.]?\s*([A-Z0-9\-]{3,})/gi)].map(
    (m) => m[0],
  );
  const firstLine = text.split(/\n/).map((l) => l.trim()).find((l) => l.length > 3 && l.length < 80) || null;
  const totals = money.slice(-3);
  return {
    vendor_guess: firstLine,
    amounts_found: [...new Set(money)].slice(0, 15),
    likely_total: totals[totals.length - 1] || null,
    dates_found: [...new Set(dates)].slice(0, 10),
    emails_found: [...new Set(emails)].slice(0, 5),
    invoice_refs: [...new Set(invoices)].slice(0, 5),
    text_preview: clean.slice(0, 800),
    char_count: clean.length,
  };
}

export async function extractPdfFromUrl(pdfUrl) {
  const u = new URL(pdfUrl);
  if (!["http:", "https:"].includes(u.protocol)) throw new Error("http(s) only");
  if (["localhost", "127.0.0.1"].includes(u.hostname)) throw new Error("private host blocked");

  const r = await fetch(pdfUrl, {
    headers: { "User-Agent": "MoneyMachine-DocClerk/1.0" },
    signal: AbortSignal.timeout(25000),
    redirect: "follow",
  });
  if (!r.ok) throw new Error(`pdf fetch ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length > 8_000_000) throw new Error("pdf too large (max 8MB)");
  const parser = new PDFParse({ data: buf });
  const data = await parser.getText();
  const text = data.text || "";
  const fields = extractFields(text);
  const pages = data.total || data.numpages || (text ? 1 : 0);
  return {
    source: pdfUrl,
    pages,
    doc_type: /invoice|receipt|bill/i.test(text) ? "invoice_or_receipt" : "document",
    fields,
    confidence: fields.likely_total ? 0.65 : 0.4,
    warnings: ["heuristic extraction — not legal advice", "public PDF URL only"],
  };
}
