// Builds the invoice / quotation PDF in the browser (nothing is uploaded).
// Three simple professional looks: classic (navy and gold), minimal (black and white), modern (blue).

import { jsPDF } from "jspdf";

export type DocKind = "invoice" | "quotation";

export interface DocItem { name: string; qty: number; rate: number }
export interface DocData {
  kind: DocKind;
  number: string;
  date: string;      // ISO yyyy-mm-dd
  due: string;       // due date (invoice) or valid-until (quotation)
  currency: string;  // ISO code, e.g. "USD"
  from: { name: string; email: string; phone: string; address: string; taxId: string };
  to: { name: string; email: string; address: string };
  items: DocItem[];
  discount: number;
  taxRate: number;
  notes: string;
  payment: string;
  logo?: { data: string; w: number; h: number } | null;  // PNG data URL, already resized
  accent?: string;                                         // "#rrggbb" override of the template colour
}

const hexToRgb = (hex: string): RGB | null => {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex || "").trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const CURRENCIES: { code: string; label: string }[] = [
  { code: "USD", label: "US Dollar" }, { code: "EUR", label: "Euro" }, { code: "GBP", label: "British Pound" },
  { code: "LKR", label: "Sri Lankan Rupee" }, { code: "INR", label: "Indian Rupee" }, { code: "AUD", label: "Australian Dollar" },
  { code: "CAD", label: "Canadian Dollar" }, { code: "SGD", label: "Singapore Dollar" }, { code: "AED", label: "UAE Dirham" },
];

// Standard PDF fonts only cover Latin letters, so a few symbols are written as codes.
const SYMBOL: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", LKR: "Rs ", INR: "INR ", AUD: "A$", CAD: "C$", SGD: "S$", AED: "AED " };
export const symbolFor = (code: string) => SYMBOL[code] ?? `${code} `;

export const money = (n: number, code: string) =>
  `${symbolFor(code)}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function totals(d: Pick<DocData, "items" | "discount" | "taxRate">) {
  const subtotal = d.items.reduce((s, i) => s + (i.qty || 0) * (i.rate || 0), 0);
  const discount = Math.min(Math.max(d.discount || 0, 0), subtotal);
  const afterDiscount = subtotal - discount;
  const tax = (afterDiscount * (d.taxRate || 0)) / 100;
  return { subtotal, discount, tax, total: afterDiscount + tax };
}

export const prettyDate = (iso: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

// Characters outside Latin-1 would print as garbage with the built-in fonts.
export const clean = (s: string) => (s || "").replace(/[^\x09\x0A\x20-\x7E\xA0-\xFF€]/g, "?");

type RGB = [number, number, number];
export type TemplateId = "classic" | "minimal" | "modern" | "dusk" | "pop";
type ThemedId = "classic" | "minimal" | "modern";   // dusk and pop are drawn in pdf-fancy.ts
export const TEMPLATES: { id: TemplateId; name: string; blurb: string }[] = [
  { id: "classic", name: "Classic", blurb: "Navy and gold, serif title" },
  { id: "minimal", name: "Minimal", blurb: "Black and white, lots of air" },
  { id: "modern", name: "Modern", blurb: "Blue header band and table" },
  { id: "dusk", name: "Dusk", blurb: "Navy night with a golden sun" },
  { id: "pop", name: "Pop", blurb: "Bold blocks and hard shadows" },
];

interface Theme {
  ink: RGB; accent: RGB; label: RGB; muted: RGB; line: RGB; due: RGB;
  band: boolean;            // coloured header band
  tableFill: boolean;       // filled table header
  totalBox: boolean;        // filled total box
  titleFont: "times" | "helvetica"; titleStyle: "bold" | "normal"; titleSize: number;
  doubleRule: boolean;
  pageBg?: RGB;             // fill every page (dark templates)
  gradient?: [RGB, RGB];    // header band fades from the first colour to the second
  totalColor?: RGB;         // colour of the big total
}
const RED: RGB = [178, 59, 59];
const THEMES: Record<ThemedId, Theme> = {
  classic: { ink: [20, 33, 61], accent: [176, 141, 87], label: [176, 141, 87], muted: [138, 131, 112], line: [236, 231, 221], due: [138, 74, 31], band: false, tableFill: false, totalBox: false, titleFont: "times", titleStyle: "bold", titleSize: 30, doubleRule: true },
  minimal: { ink: [17, 17, 17], accent: [17, 17, 17], label: [140, 140, 140], muted: [120, 120, 120], line: [225, 225, 225], due: [17, 17, 17], band: false, tableFill: false, totalBox: false, titleFont: "helvetica", titleStyle: "normal", titleSize: 34, doubleRule: false },
  modern: { ink: [10, 20, 51], accent: [29, 91, 224], label: [29, 91, 224], muted: [102, 112, 140], line: [228, 233, 245], due: [29, 91, 224], band: true, tableFill: true, totalBox: true, titleFont: "helvetica", titleStyle: "bold", titleSize: 26, doubleRule: false },
};

export function buildPdf(d: DocData, template: TemplateId = "classic"): jsPDF {
  let T = THEMES[template as ThemedId] ?? THEMES.classic;
  const custom = hexToRgb(d.accent || "");
  if (custom) T = { ...T, accent: custom, label: custom, due: custom };
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const paint = () => { if (T.pageBg) { doc.setFillColor(...T.pageBg); doc.rect(0, 0, 210, 297, "F"); } };
  const gradientRect = (x: number, y: number, w: number, h: number, c1: RGB, c2: RGB) => {
    const steps = 90, sw = w / steps;
    for (let i = 0; i < steps; i++) {
      const k = i / (steps - 1);
      doc.setFillColor(Math.round(c1[0] + (c2[0] - c1[0]) * k), Math.round(c1[1] + (c2[1] - c1[1]) * k), Math.round(c1[2] + (c2[2] - c1[2]) * k));
      doc.rect(x + i * sw, y, sw + 0.35, h, "F");
    }
  };
  paint();
  const W = 210, M = 18, R = W - M;
  const isInvoice = d.kind === "invoice";
  const t = totals(d);
  const items = d.items.filter((i) => i.name.trim());

  const color = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);
  const label = (text: string, x: number, y: number, align: "left" | "right" = "left", c: RGB = T.label) => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); color(c); doc.text(text.toUpperCase(), x, y, { align });
  };
  const footer = () => {
    doc.setDrawColor(...T.line); doc.setLineWidth(0.25); doc.line(M, 283, R, 283);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); color(T.muted);
    doc.text("Created with FreelanceDesk", W / 2, 289, { align: "center" });
  };

  // ── header ──
  let y = 24;
  const titleText = isInvoice ? "INVOICE" : "QUOTATION";
  const fromLines = [
    ...clean(d.from.address).split("\n"),
    d.from.taxId ? `Tax ID: ${clean(d.from.taxId)}` : "",
    clean([d.from.email, d.from.phone].filter(Boolean).join("  ·  ")),
  ].filter((l) => l.trim());

  // optional logo: fits in a 44 x 16 mm box at the top left; the business block moves down to make room
  let lw = 0, lh = 0;
  if (d.logo && d.logo.w > 0 && d.logo.h > 0) {
    const k = Math.min(44 / d.logo.w, 16 / d.logo.h);
    lw = d.logo.w * k; lh = d.logo.h * k;
  }
  const ly = lh ? 12 + lh + 8 : y;   // baseline of the business name

  if (T.band) {
    const bandH = Math.max(46, ly + 6 + fromLines.length * 4.6 + 6);
    if (T.gradient) {
      gradientRect(0, 0, W, bandH, T.gradient[0], T.gradient[1]);
      doc.setFillColor(255, 255, 255); doc.triangle(0, bandH + 0.4, W, bandH + 0.4, W, bandH - 14, "F");   // slanted lower edge
    } else {
      doc.setFillColor(...T.accent); doc.rect(0, 0, W, bandH, "F");
    }
    if (lh) {
      doc.setFillColor(255, 255, 255); doc.roundedRect(M - 2, 10, lw + 4, lh + 4, 2, 2, "F");
      doc.addImage(d.logo!.data, "PNG", M, 12, lw, lh);
    }
    doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.setTextColor(255, 255, 255);
    doc.text(clean(d.from.name || "Your business"), M, ly);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(214, 228, 255);
    let fy = ly + 6;
    for (const l of fromLines) { doc.text(l, M, fy); fy += 4.6; }
    doc.setFont(T.titleFont, T.titleStyle); doc.setFontSize(T.titleSize); doc.setTextColor(255, 255, 255);
    doc.text(titleText, R, y + 3, { align: "right" });
    doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.setTextColor(214, 228, 255);
    doc.text(clean(d.number).toUpperCase(), R, y + 10, { align: "right" });
    y = bandH + 4;
  } else {
    if (lh) doc.addImage(d.logo!.data, "PNG", M, 12, lw, lh);
    doc.setFont("helvetica", "bold"); doc.setFontSize(15); color(T.ink);
    doc.text(clean(d.from.name || "Your business"), M, ly);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); color(T.muted);
    let fy = ly + 6;
    for (const l of fromLines) { doc.text(l, M, fy); fy += 4.6; }

    doc.setFont(T.titleFont, T.titleStyle); doc.setFontSize(T.titleSize); color(T.ink);
    doc.text(titleText, R, y + 2, { align: "right" });
    doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); color(T.accent);
    doc.text(clean(d.number).toUpperCase(), R, y + 9, { align: "right" });

    y = Math.max(fy, 42) + 4;
    doc.setDrawColor(...T.ink); doc.setLineWidth(T.doubleRule ? 0.7 : 0.3); doc.line(M, y, R, y);
    if (T.doubleRule) { doc.setDrawColor(...T.accent); doc.setLineWidth(0.25); doc.line(M, y + 1.6, R, y + 1.6); }
  }

  // ── parties + dates ──
  y += 13;
  label(isInvoice ? "Bill to" : "Prepared for", M, y);
  doc.setFont("helvetica", "bold"); doc.setFontSize(11.5); color(T.ink);
  doc.text(clean(d.to.name || "Client name"), M, y + 6);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); color(T.muted);
  let cy = y + 11.5;
  for (const l of [clean(d.to.email), ...clean(d.to.address).split("\n")].filter((l) => l.trim())) { doc.text(l, M, cy); cy += 4.6; }

  label(isInvoice ? "Invoice date" : "Quotation date", 118, y);
  doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); color(T.ink); doc.text(prettyDate(d.date), 118, y + 6);
  label(isInvoice ? "Due date" : "Valid until", 158, y);
  doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); color(T.due); doc.text(prettyDate(d.due), 158, y + 6);

  y = Math.max(cy, y + 14) + 8;

  // ── table ──
  const header = () => {
    if (T.tableFill) {
      doc.setFillColor(...T.accent); doc.roundedRect(M - 2, y - 5, R - M + 4, 9, 1.5, 1.5, "F");
      const w: RGB = [255, 255, 255];
      label("Description", M + 1, y + 1, "left", w);
      label("Qty", 128, y + 1, "right", w); label("Rate", 158, y + 1, "right", w); label("Amount", R - 1, y + 1, "right", w);
      y += 11;
    } else {
      label("Description", M, y);
      label("Qty", 128, y, "right"); label("Rate", 158, y, "right"); label("Amount", R, y, "right");
      doc.setDrawColor(...T.ink); doc.setLineWidth(0.4); doc.line(M, y + 2.4, R, y + 2.4);
      y += 9;
    }
  };
  header();
  for (const it of items) {
    const lines: string[] = doc.splitTextToSize(clean(it.name), 84);
    const h = Math.max(lines.length * 4.8, 6) + 4;
    if (y + h > 262) { footer(); doc.addPage(); paint(); y = 24; header(); }
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); color(T.ink);
    doc.text(lines, M, y);
    color(T.muted);
    doc.text(String(it.qty), 128, y, { align: "right" });
    doc.text(it.rate.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 158, y, { align: "right" });
    doc.setFont("helvetica", "bold"); color(T.ink);
    doc.text((it.qty * it.rate).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), R, y, { align: "right" });
    doc.setDrawColor(...T.line); doc.setLineWidth(0.25); doc.line(M, y + h - 3.2, R, y + h - 3.2);
    y += h;
  }

  // ── totals ──
  if (y > 226) { footer(); doc.addPage(); paint(); y = 24; }
  y += 6;
  const row = (name: string, value: string, c: RGB = T.muted) => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); color(T.muted); doc.text(name, 128, y);
    color(c); doc.text(value, R, y, { align: "right" }); y += 6.5;
  };
  row("Subtotal", money(t.subtotal, d.currency));
  if (t.discount > 0) row("Discount", "-" + money(t.discount, d.currency), RED);
  if (d.taxRate > 0) row(`Tax (${d.taxRate}%)`, money(t.tax, d.currency));
  y += 1.5;
  if (T.totalBox) {
    if (T.gradient) gradientRect(122, y - 1, R - 122, 14, T.gradient[0], T.gradient[1]);
    else { doc.setFillColor(...T.accent); doc.roundedRect(122, y - 1, R - 122, 14, 2, 2, "F"); }
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(214, 228, 255);
    doc.text(isInvoice ? "TOTAL DUE" : "ESTIMATED TOTAL", 126, y + 8);
    doc.setFontSize(14); doc.setTextColor(255, 255, 255);
    doc.text(money(t.total, d.currency), R - 4, y + 8.2, { align: "right" });
    y += 24;
  } else {
    doc.setDrawColor(...T.ink); doc.setLineWidth(0.5); doc.line(122, y, R, y);
    y += 8;
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); color(T.ink);
    doc.text(isInvoice ? "TOTAL DUE" : "ESTIMATED TOTAL", 122, y);
    doc.setFont(template === "classic" ? "times" : "helvetica", "bold"); doc.setFontSize(19); if (T.totalColor) color(T.totalColor); doc.text(money(t.total, d.currency), R, y + 0.5, { align: "right" });
    y += 14;
  }

  // ── notes / payment ──
  const block = (title: string, body: string) => {
    const lines: string[] = doc.splitTextToSize(clean(body), 120);
    if (y + lines.length * 4.8 + 12 > 278) { footer(); doc.addPage(); paint(); y = 24; }
    label(title, M, y);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); color(T.ink);
    doc.text(lines, M, y + 6);
    y += lines.length * 4.8 + 13;
  };
  if (isInvoice && d.payment.trim()) block("Payment details", d.payment);
  if (d.notes.trim()) block(isInvoice ? "Notes" : "Notes and terms", d.notes);
  if (!isInvoice) block("Note", "This is an estimate, not a bill. Prices may change if the scope of work changes.");

  footer();
  return doc;
}
