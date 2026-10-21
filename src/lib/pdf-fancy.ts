// Two "app-style" PDF looks for the free generator, drawn with plain shapes (no images):
//  - Dusk: navy night with a golden sun, like the app's Eclipse template
//  - Pop:  cream page, thick outlines, hard shadows and bright blocks, like the app's Pop template
// Both reuse the same data model as pdf.ts, so logo and accent colour work too.

import { jsPDF } from "jspdf";
import { totals, money, prettyDate, clean, type DocData } from "./pdf";

type RGB = [number, number, number];
export type FancyId = "dusk" | "pop";
export const isFancy = (id: string): id is FancyId => id === "dusk" || id === "pop";

const hex = (h?: string): RGB | null => {
  const m = /^#?([0-9a-f]{6})$/i.exec((h || "").trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mix = (a: RGB, b: RGB, k: number): RGB => [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * k)) as RGB;
const num = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function buildFancyPdf(d: DocData, id: FancyId): jsPDF {
  return id === "dusk" ? buildDusk(d) : buildPop(d);
}

// ── shared pieces ──────────────────────────────────────────────────────────
function logoBox(d: DocData, maxW: number, maxH: number) {
  if (!d.logo || d.logo.w <= 0 || d.logo.h <= 0) return { w: 0, h: 0 };
  const k = Math.min(maxW / d.logo.w, maxH / d.logo.h);
  return { w: d.logo.w * k, h: d.logo.h * k };
}
function fromLines(d: DocData): string[] {
  return [
    ...clean(d.from.address).split("\n"),
    d.from.taxId ? `Tax ID: ${clean(d.from.taxId)}` : "",
    clean([d.from.email, d.from.phone].filter(Boolean).join("  ·  ")),
  ].filter((l) => l.trim());
}

// ════════════════════════════════════════════════════════════════════════════
// DUSK
// ════════════════════════════════════════════════════════════════════════════
function buildDusk(d: DocData): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, H = 297, M = 18, R = W - M;
  const isInv = d.kind === "invoice";
  const t = totals(d);
  const items = d.items.filter((i) => i.name.trim());
  const GOLD: RGB = hex(d.accent) || [255, 208, 90];
  const GOLD2: RGB = mix(GOLD, [255, 112, 64], 0.55);
  const WHITE: RGB = [255, 255, 255], SOFT: RGB = [176, 192, 232], FAINT: RGB = [118, 136, 190];
  const CARD: RGB = [15, 28, 78], ROW: RGB = [13, 24, 66];
  const col = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);
  const strips = (x: number, y: number, w: number, h: number, c1: RGB, c2: RGB) => {
    const n = 70;
    for (let i = 0; i < n; i++) { doc.setFillColor(...mix(c1, c2, i / (n - 1))); doc.rect(x + (i * w) / n, y, w / n + 0.3, h, "F"); }
  };

  const paint = () => {
    const n = 80, h = H / n;
    for (let i = 0; i < n; i++) { doc.setFillColor(...mix([9, 26, 84], [3, 7, 25], i / (n - 1))); doc.rect(0, i * h, W, h + 0.4, "F"); }
    strips(0, 0, W, 2.6, GOLD, GOLD2);                      // gold edge across the top
  };
  const footer = () => {
    doc.setDrawColor(40, 56, 120); doc.setLineWidth(0.25); doc.line(M, 283, R, 283);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); col(FAINT);
    doc.text("Created with FreelanceDesk", W / 2, 289, { align: "center" });
  };
  const label = (text: string, x: number, y: number, align: "left" | "right" = "left", c: RGB = FAINT) => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(7); col(c); doc.text(text.toUpperCase(), x, y, { align, charSpace: 0.4 });
  };

  paint();

  // header: brand on the left, the big gold title on the right (same as the live preview)
  const lg = logoBox(d, 40, 14);
  let y = 26;
  if (lg.h) { doc.setFillColor(255, 255, 255); doc.roundedRect(M - 1.5, 12.5, lg.w + 3, lg.h + 3, 2, 2, "F"); doc.addImage(d.logo!.data, "PNG", M, 14, lg.w, lg.h); y = 14 + lg.h + 10; }
  doc.setFont("helvetica", "bold"); doc.setFontSize(15); col(WHITE); doc.text(clean(d.from.name || "Your business"), M, y);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.8); col(SOFT);
  let fy = y + 5.6;
  for (const l of fromLines(d)) { doc.text(l, M, fy); fy += 4.5; }

  const title = isInv ? "INVOICE" : "QUOTATION";
  let size = 38; doc.setFont("helvetica", "bold");
  do { doc.setFontSize(size); size -= 1; } while (doc.getTextWidth(title) > 104 && size > 18);
  col(GOLD); doc.text(title, R, 29, { align: "right" });
  doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); col(WHITE); doc.text(clean(d.number).toUpperCase(), R, 36, { align: "right", charSpace: 0.8 });

  // info cards with a gold top edge
  y = Math.max(fy, 46) + 8;
  const cards: [string, string, string, number][] = [
    [isInv ? "Bill to" : "Prepared for", clean(d.to.name || "Client name"), clean(d.to.email), 82],
    [isInv ? "Invoice date" : "Quotation date", prettyDate(d.date), "", 43],
    [isInv ? "Due date" : "Valid until", prettyDate(d.due), "", 43],
  ];
  let cx = M;
  for (const [lab, val, sub, w] of cards) {
    doc.setFillColor(...CARD); doc.setDrawColor(46, 66, 138); doc.setLineWidth(0.25); doc.roundedRect(cx, y, w, 19, 3, 3, "FD");
    doc.setDrawColor(...GOLD); doc.setLineWidth(0.8); doc.line(cx + 5, y + 0.4, cx + w - 5, y + 0.4);
    label(lab, cx + 4, y + 7);
    doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); col(WHITE); doc.text(doc.splitTextToSize(val, w - 8)[0] as string, cx + 4, y + 12.8);
    if (sub) { doc.setFont("helvetica", "normal"); doc.setFontSize(8); col(SOFT); doc.text(doc.splitTextToSize(sub, w - 8)[0] as string, cx + 4, y + 16.6); }
    cx += w + 3;
  }
  y += 25;

  // amount band: gold border, big gold figure
  doc.setFillColor(...ROW); doc.setDrawColor(...GOLD); doc.setLineWidth(0.5); doc.roundedRect(M, y, R - M, 20, 4, 4, "FD");
  label(isInv ? "Amount due" : "Estimated total", M + 6, y + 7.5, "left", GOLD);
  doc.setFont("helvetica", "bold"); doc.setFontSize(21); col(GOLD); doc.text(money(t.total, d.currency), M + 6, y + 16);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); col(SOFT);
  doc.text(`${isInv ? "Invoice" : "Quotation"} for ${clean(d.to.name || "Client name")}`, R - 6, y + 12.2, { align: "right" });
  y += 30;

  // items
  const head = () => {
    label("Description", M + 4, y); label("Qty", 128, y, "right"); label("Rate", 158, y, "right"); label("Amount", R - 4, y, "right");
    y += 4;
  };
  head();
  for (const it of items) {
    const lines: string[] = doc.splitTextToSize(clean(it.name), 84);
    const h = Math.max(lines.length * 4.8, 5) + 6;
    if (y + h > 252) { footer(); doc.addPage(); paint(); y = 24; head(); }
    doc.setFillColor(...ROW); doc.roundedRect(M, y, R - M, h, 2.5, 2.5, "F");
    doc.setFillColor(...GOLD); doc.roundedRect(M, y + 2, 1.1, h - 4, 0.5, 0.5, "F");   // gold tick on every row
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); col(WHITE); doc.text(lines, M + 5, y + 6.4);
    col(SOFT); doc.text(String(it.qty), 128, y + 6.4, { align: "right" }); doc.text(num(it.rate), 158, y + 6.4, { align: "right" });
    doc.setFont("helvetica", "bold"); col(GOLD); doc.text(num(it.qty * it.rate), R - 4, y + 6.4, { align: "right" });
    y += h + 2;
  }

  // totals (right) with payment + notes on the left
  if (y > 226) { footer(); doc.addPage(); paint(); y = 24; }
  y += 4;
  const totalsTop = y;
  const row = (name: string, value: string, c: RGB = SOFT) => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); col(SOFT); doc.text(name, 128, y);
    col(c); doc.text(value, R, y, { align: "right" }); y += 6.5;
  };
  row("Subtotal", money(t.subtotal, d.currency));
  if (t.discount > 0) row("Discount", "-" + money(t.discount, d.currency), [255, 140, 150]);
  if (d.taxRate > 0) row(`Tax (${d.taxRate}%)`, money(t.tax, d.currency));
  y += 1.5;
  strips(120, y - 1, R - 120, 14, GOLD, GOLD2);
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(40, 18, 4); doc.text(isInv ? "TOTAL DUE" : "ESTIMATED TOTAL", 124, y + 8);
  doc.setFontSize(14); doc.text(money(t.total, d.currency), R - 3, y + 8.3, { align: "right" });
  y += 24;

  let ly = totalsTop;
  const block = (titleText: string, body: string) => {
    const lines: string[] = doc.splitTextToSize(clean(body), 92);
    label(titleText, M, ly + 3, "left", GOLD);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); col(SOFT); doc.text(lines, M, ly + 9);
    ly += lines.length * 4.6 + 14;
  };
  if (isInv && d.payment.trim()) block("Payment details", d.payment);
  if (d.notes.trim()) block(isInv ? "Notes" : "Notes and terms", d.notes);
  if (!isInv) block("Note", "This is an estimate, not a bill. Prices may change if the scope of work changes.");
  y = Math.max(y, ly);
  footer();
  return doc;
}

// ════════════════════════════════════════════════════════════════════════════
// POP
// ════════════════════════════════════════════════════════════════════════════
function buildPop(d: DocData): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, H = 297, M = 16, R = W - M;
  const isInv = d.kind === "invoice";
  const t = totals(d);
  const items = d.items.filter((i) => i.name.trim());
  const INK: RGB = [11, 11, 11], CREAM: RGB = [255, 244, 214], WHITE: RGB = [255, 255, 255];
  const YEL: RGB = hex(d.accent) || [255, 210, 63];
  const PINK: RGB = [255, 111, 177], BLUE: RGB = [88, 166, 255], MINT: RGB = [126, 240, 192];
  const col = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);

  const paint = () => {
    doc.setFillColor(...CREAM); doc.rect(0, 0, W, H, "F");
    doc.setFillColor(214, 198, 156);
    for (let x = 8; x < W; x += 8) for (let yy = 8; yy < H; yy += 8) doc.circle(x, yy, 0.32, "F");
  };
  const box = (x: number, y: number, w: number, h: number, fill: RGB, sh = 1.6, lw = 0.9) => {
    doc.setFillColor(...INK); doc.rect(x + sh, y + sh, w, h, "F");
    doc.setFillColor(...fill); doc.setDrawColor(...INK); doc.setLineWidth(lw); doc.rect(x, y, w, h, "FD");
  };
  const label = (text: string, x: number, y: number, align: "left" | "right" = "left", c: RGB = INK) => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(7); col(c); doc.text(text.toUpperCase(), x, y, { align, charSpace: 0.4 });
  };
  const footer = () => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); col(INK); doc.text("Created with FreelanceDesk", W / 2, 290, { align: "center" });
  };

  paint();

  // brand box (and logo) top left, number sticker top right
  const lg = logoBox(d, 34, 13);
  let bx = M;
  if (lg.h) { box(M, 14, lg.w + 6, lg.h + 6, WHITE); doc.addImage(d.logo!.data, "PNG", M + 3, 17, lg.w, lg.h); bx = M + lg.w + 14; }
  const name = clean(d.from.name || "Your business").toUpperCase();
  let ns = 11; doc.setFont("helvetica", "bold");
  do { doc.setFontSize(ns); ns -= 0.5; } while (doc.getTextWidth(name) > R - bx - 52 && ns > 7);
  const nw = doc.getTextWidth(name) + 10;
  box(bx, 14, nw, 11, WHITE); col(INK); doc.text(name, bx + 5, 21.2);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); col(INK);
  let fy = Math.max(lg.h ? 14 + lg.h + 6 : 25, 25) + 8;
  for (const l of fromLines(d)) { doc.text(l, M, fy); fy += 4.3; }

  // sticker
  doc.setFillColor(...INK); doc.circle(R - 14 + 1.6, 26 + 1.6, 13, "F");
  doc.setFillColor(...PINK); doc.setDrawColor(...INK); doc.setLineWidth(0.9); doc.circle(R - 14, 26, 13, "FD");
  doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); col(INK); doc.text("NO.", R - 14, 22.2, { align: "center" });
  const num_ = clean(d.number).toUpperCase(); let s2 = 10; do { doc.setFontSize(s2); s2 -= 0.5; } while (doc.getTextWidth(num_) > 21 && s2 > 5);
  doc.text(num_, R - 14, 28.5, { align: "center" });

  // huge title on a yellow block
  const title = isInv ? "INVOICE" : "QUOTATION";
  let size = 58; doc.setFont("helvetica", "bold");
  do { doc.setFontSize(size); size -= 1; } while (doc.getTextWidth(title) > W - 2 * M - 10 && size > 22);
  const tw = doc.getTextWidth(title), th = size * 0.352 * 1.15;
  const ty = Math.max(fy + th + 1, 70);
  doc.setFillColor(...YEL); doc.rect(M - 3, ty - th + 2, tw + 8, th + 5, "F");
  col(INK); doc.text(title, M, ty);

  // three colour cards
  let y = ty + 14;
  const cards: [string, string, string, number, RGB][] = [
    [isInv ? "Bill to" : "Prepared for", clean(d.to.name || "Client name"), clean(d.to.email), 84, BLUE],
    ["Issued", prettyDate(d.date), "", 44, YEL],
    [isInv ? "Due" : "Valid until", prettyDate(d.due), "", 44, MINT],
  ];
  let cx = M;
  for (const [lab, val, sub, w, fill] of cards) {
    box(cx, y, w, 18, fill, 1.5, 0.9);
    label(lab, cx + 3.5, y + 6);
    doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); col(INK); doc.text(doc.splitTextToSize(val, w - 7)[0] as string, cx + 3.5, y + 11.8);
    if (sub) { doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.text(doc.splitTextToSize(sub, w - 7)[0] as string, cx + 3.5, y + 15.4); }
    cx += w + 4;
  }
  y += 30;

  // items table: one outlined block with a black header; split across pages if needed
  const rowH = (name: string) => { doc.setFont("helvetica", "bold"); doc.setFontSize(10); return Math.max((doc.splitTextToSize(clean(name), 80) as string[]).length * 4.8, 5) + 6; };
  let idx = 0;
  while (idx < items.length) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    let h = 9, end = idx;
    while (end < items.length && y + h + rowH(items[end].name) <= 256) { h += rowH(items[end].name); end++; }
    if (end === idx) end = idx + 1, h += rowH(items[idx].name);
    box(M, y, R - M, h, WHITE, 1.8, 0.9);
    doc.setFillColor(...INK); doc.rect(M, y, R - M, 9, "F");
    label("Description", M + 4, y + 5.9, "left", YEL); label("Qty", 130, y + 5.9, "right", YEL); label("Rate", 158, y + 5.9, "right", YEL); label("Amount", R - 4, y + 5.9, "right", YEL);
    let ry = y + 9;
    for (let i = idx; i < end; i++) {
      const it = items[i], lines: string[] = doc.splitTextToSize(clean(it.name), 80), rh = rowH(it.name);
      if (i > idx) { doc.setDrawColor(...INK); doc.setLineWidth(0.4); doc.line(M, ry, R, ry); }
      doc.setFont("helvetica", "bold"); doc.setFontSize(10); col(INK); doc.text(lines, M + 4, ry + 6.4);
      doc.setFont("helvetica", "normal"); doc.text(String(it.qty), 130, ry + 6.4, { align: "right" }); doc.text(num(it.rate), 158, ry + 6.4, { align: "right" });
      doc.setFont("helvetica", "bold"); doc.text(num(it.qty * it.rate), R - 4, ry + 6.4, { align: "right" });
      ry += rh;
    }
    y += h + 8;
    idx = end;
    if (idx < items.length) { footer(); doc.addPage(); paint(); y = 22; }
  }

  // payment box (dashed) on the left, totals on the right
  if (y > 216) { footer(); doc.addPage(); paint(); y = 22; }
  const top = y;
  const payText = isInv && d.payment.trim() ? clean(d.payment) : "";
  const noteText = d.notes.trim() ? clean(d.notes) : "";
  const left = [payText && "PAYMENT DETAILS\n" + payText, noteText && (isInv ? "NOTES" : "NOTES AND TERMS") + "\n" + noteText].filter(Boolean).join("\n\n") || (isInv ? "" : "NOTE\nThis is an estimate, not a bill. Prices may change if the scope of work changes.");
  if (left) {
    const lines: string[] = doc.splitTextToSize(left, 84);
    const bh = lines.length * 4.4 + 8;
    doc.setFillColor(...WHITE); doc.setDrawColor(...INK); doc.setLineWidth(0.8); doc.setLineDashPattern([2, 1.5], 0); doc.rect(M, top, 92, bh, "FD"); doc.setLineDashPattern([], 0);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); col(INK);
    lines.forEach((ln, i) => { if (/^(PAYMENT DETAILS|NOTES|NOTES AND TERMS|NOTE)$/.test(ln)) doc.setFont("helvetica", "bold"); else doc.setFont("helvetica", "normal"); doc.text(ln, M + 4, top + 6.5 + i * 4.4); });
  }
  y = top + 2;
  const row = (nameT: string, value: string) => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); col(INK); doc.text(nameT, 126, y + 3); doc.text(value, R, y + 3, { align: "right" }); y += 7;
  };
  row("Subtotal", money(t.subtotal, d.currency));
  if (t.discount > 0) row("Discount", "-" + money(t.discount, d.currency));
  if (d.taxRate > 0) row(`Tax (${d.taxRate}%)`, money(t.tax, d.currency));
  y += 3;
  box(122, y, R - 122 - 1.8, 16, PINK, 1.8, 0.9);
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); col(INK); doc.text(isInv ? "TOTAL DUE" : "ESTIMATED TOTAL", 126, y + 9.6);
  doc.setFontSize(15); doc.text(money(t.total, d.currency), R - 6, y + 10.2, { align: "right" });

  // sign-off
  doc.setFont("helvetica", "bold"); doc.setFontSize(16); col(INK); doc.text("THANK YOU!", M, 276);
  footer();
  return doc;
}
