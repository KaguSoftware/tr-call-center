import { jsPDF } from "jspdf";
import type { Bucket, SummaryResult } from "@/lib/summary";
import { formatTrDateShort, formatTrPercent, t } from "@/lib/strings";
import { NOTO_SANS_BOLD_BASE64, NOTO_SANS_REGULAR_BASE64 } from "@/lib/fonts/noto-sans-base64";

const ACCENT_RGB: [number, number, number] = [46, 158, 143];
const MUTED_RGB: [number, number, number] = [100, 116, 139];
const TEXT_RGB: [number, number, number] = [15, 23, 42];
const BORDER_RGB: [number, number, number] = [226, 232, 240];
const TRACK_RGB: [number, number, number] = [241, 245, 249];
const GOOD_RGB: [number, number, number] = [22, 163, 74];
const BAD_RGB: [number, number, number] = [220, 38, 38];

const CHART_PALETTE: [number, number, number][] = [
  [46, 158, 143],
  [37, 99, 235],
  [217, 119, 6],
  [147, 51, 234],
  [220, 38, 38],
  [8, 145, 178],
  [202, 138, 4],
  [190, 24, 93],
];

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 16;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function registerFont(doc: jsPDF) {
  doc.addFileToVFS("NotoSans-Regular.ttf", NOTO_SANS_REGULAR_BASE64);
  doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
  doc.addFileToVFS("NotoSans-Bold.ttf", NOTO_SANS_BOLD_BASE64);
  doc.addFont("NotoSans-Bold.ttf", "NotoSans", "bold");
  doc.setFont("NotoSans", "normal");
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_HEIGHT - MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function sectionTitle(doc: jsPDF, y: number, title: string): number {
  y = ensureSpace(doc, y, 12);
  doc.setFont("NotoSans", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...TEXT_RGB);
  doc.text(title, MARGIN, y);
  return y + 7;
}

// Horizontal bar chart — one bar per bucket, value labels on the right.
function drawBarChart(doc: jsPDF, y: number, buckets: Bucket[], opts: { maxRows?: number } = {}): number {
  const rows = opts.maxRows ? buckets.slice(0, opts.maxRows) : buckets;
  if (rows.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(...MUTED_RGB);
    doc.text("—", MARGIN, y);
    return y + 6;
  }
  const max = rows.reduce((m, b) => Math.max(m, b.value), 0) || 1;
  const labelWidth = 45;
  const valueWidth = 22;
  const barAreaWidth = CONTENT_WIDTH - labelWidth - valueWidth;
  const barHeight = 4.5;
  const rowGap = 7.5;

  rows.forEach((b, i) => {
    y = ensureSpace(doc, y, rowGap);
    const color = CHART_PALETTE[i % CHART_PALETTE.length];

    doc.setFont("NotoSans", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...TEXT_RGB);
    const label = doc.splitTextToSize(b.label, labelWidth - 2)[0] as string;
    doc.text(label, MARGIN, y + barHeight - 0.5);

    const barX = MARGIN + labelWidth;
    doc.setFillColor(...TRACK_RGB);
    doc.roundedRect(barX, y - barHeight + 1.5, barAreaWidth, barHeight, 1, 1, "F");
    const w = Math.max(2, (b.value / max) * barAreaWidth);
    doc.setFillColor(...color);
    doc.roundedRect(barX, y - barHeight + 1.5, w, barHeight, 1, 1, "F");

    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED_RGB);
    const valueText = b.value.toLocaleString("tr-TR") + (b.secondary ? ` (${b.secondary})` : "");
    doc.text(valueText, barX + barAreaWidth + 3, y + barHeight - 0.5);

    y += rowGap;
  });
  return y + 3;
}

// Simple pie/donut chart drawn as filled wedges via jsPDF's lines() path API.
function drawPieChart(doc: jsPDF, y: number, buckets: Bucket[]): number {
  const nonZero = buckets.filter((b) => b.value > 0);
  const total = nonZero.reduce((s, b) => s + b.value, 0);
  const chartHeight = 44;
  y = ensureSpace(doc, y, chartHeight);
  if (total === 0) {
    doc.setFontSize(9);
    doc.setTextColor(...MUTED_RGB);
    doc.text("—", MARGIN, y);
    return y + 6;
  }

  const cx = MARGIN + 22;
  const cy = y + chartHeight / 2 - 2;
  const r = 18;

  let startAngle = -Math.PI / 2;
  nonZero.forEach((b, i) => {
    const frac = b.value / total;
    const endAngle = startAngle + frac * Math.PI * 2;
    const color = CHART_PALETTE[i % CHART_PALETTE.length];
    doc.setFillColor(...color);

    const steps = Math.max(2, Math.ceil(frac * 40));
    const points: [number, number][] = [];
    for (let s = 0; s <= steps; s++) {
      const a = startAngle + (endAngle - startAngle) * (s / steps);
      points.push([cx + r * Math.cos(a) - cx, cy + r * Math.sin(a) - cy]);
    }
    doc.lines(points, cx, cy, [1, 1], "F", true);
    startAngle = endAngle;
  });

  // Legend to the right of the pie.
  const legendX = cx + r + 14;
  let legendY = y + 3;
  doc.setFontSize(8.5);
  nonZero.forEach((b, i) => {
    const color = CHART_PALETTE[i % CHART_PALETTE.length];
    doc.setFillColor(...color);
    doc.rect(legendX, legendY - 3, 3.5, 3.5, "F");
    doc.setFont("NotoSans", "normal");
    doc.setTextColor(...TEXT_RGB);
    const pct = Math.round((b.value / total) * 100);
    doc.text(`${b.label} — ${b.value.toLocaleString("tr-TR")} (%${pct})`, legendX + 5, legendY);
    legendY += 5.5;
  });

  return y + chartHeight;
}

// Trend line chart with filled area under the line.
function drawTrendChart(doc: jsPDF, y: number, trend: { date: string; count: number }[], isMonthly: boolean): number {
  const chartHeight = 40;
  y = ensureSpace(doc, y, chartHeight + 8);
  if (trend.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(...MUTED_RGB);
    doc.text("—", MARGIN, y);
    return y + 6;
  }
  const max = trend.reduce((m, d) => Math.max(m, d.count), 0) || 1;
  const chartX = MARGIN;
  const chartW = CONTENT_WIDTH;
  const baseY = y + chartHeight;

  // Axis baseline.
  doc.setDrawColor(...BORDER_RGB);
  doc.setLineWidth(0.3);
  doc.line(chartX, baseY, chartX + chartW, baseY);

  const stepX = trend.length > 1 ? chartW / (trend.length - 1) : 0;
  const points: [number, number][] = trend.map((d, i) => [
    chartX + i * stepX,
    baseY - (d.count / max) * chartHeight,
  ]);

  // Filled area under line — light tint (no alpha blending needed).
  const AREA_TINT_RGB: [number, number, number] = [219, 237, 234];
  const area: [number, number][] = [[chartX, baseY], ...points, [chartX + (trend.length - 1) * stepX, baseY]];
  doc.setFillColor(...AREA_TINT_RGB);
  const relArea: [number, number][] = area.map(([px, py]) => [px - area[0][0], py - area[0][1]]);
  doc.lines(relArea, area[0][0], area[0][1], [1, 1], "F", true);

  // Line itself.
  doc.setDrawColor(...ACCENT_RGB);
  doc.setLineWidth(0.7);
  for (let i = 0; i < points.length - 1; i++) {
    doc.line(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1]);
  }
  doc.setFillColor(...ACCENT_RGB);
  for (const [px, py] of points) {
    doc.circle(px, py, 0.8, "F");
  }

  // X-axis labels — sparse to avoid overlap.
  doc.setFontSize(7);
  doc.setTextColor(...MUTED_RGB);
  const labelEvery = Math.max(1, Math.ceil(trend.length / 8));
  trend.forEach((d, i) => {
    if (i % labelEvery !== 0 && i !== trend.length - 1) return;
    const label = isMonthly ? d.date.replace("-", "/") : formatTrDateShort(d.date);
    doc.text(label, points[i][0], baseY + 5, { align: "center" });
  });

  return baseY + 10;
}

function drawKpiCards(doc: jsPDF, y: number, cards: { label: string; value: string; deltaText?: string; deltaGood?: boolean }[]): number {
  const cols = 4;
  const gap = 4;
  const cardW = (CONTENT_WIDTH - gap * (cols - 1)) / cols;
  const cardH = 22;
  y = ensureSpace(doc, y, cardH);

  cards.forEach((c, i) => {
    const x = MARGIN + i * (cardW + gap);
    doc.setDrawColor(...BORDER_RGB);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, cardW, cardH, 2, 2, "S");

    doc.setFont("NotoSans", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED_RGB);
    const labelLines = doc.splitTextToSize(c.label, cardW - 4);
    doc.text(labelLines, x + 3, y + 6);

    doc.setFont("NotoSans", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...TEXT_RGB);
    doc.text(c.value, x + 3, y + 15);

    if (c.deltaText) {
      doc.setFont("NotoSans", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...(c.deltaGood ? GOOD_RGB : BAD_RGB));
      doc.text(c.deltaText, x + 3, y + 19.5);
    }
  });

  return y + cardH + 8;
}

function addPageNumbers(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("NotoSans", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED_RGB);
    doc.text(`${i} / ${pageCount}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 8, { align: "right" });
  }
}

export function renderSummaryPdf(result: SummaryResult, rangeLabel: string): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  registerFont(doc);

  let y = MARGIN;

  // ---- Header ----
  doc.setFillColor(...ACCENT_RGB);
  doc.rect(0, 0, PAGE_WIDTH, 24, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("NotoSans", "bold");
  doc.setFontSize(16);
  doc.text(t.appName, MARGIN, 14);
  doc.setFont("NotoSans", "normal");
  doc.setFontSize(9.5);
  doc.text(`${t.summaryTitle} — ${rangeLabel}`, MARGIN, 20.5);
  y = 33;
  doc.setTextColor(...TEXT_RGB);

  // ---- KPI cards ----
  const resolutionValue = result.resolutionRate.value === null ? "—" : formatTrPercent(result.resolutionRate.value);
  const resolutionDelta = result.resolutionRate.delta === null ? undefined : formatTrPercent(result.resolutionRate.delta, { signed: true });

  y = drawKpiCards(doc, y, [
    {
      label: t.kpiTotal,
      value: result.totalCalls.value.toLocaleString("tr-TR"),
      deltaText: result.totalCalls.delta != null ? formatTrPercent(result.totalCalls.delta, { signed: true }) : undefined,
      deltaGood: (result.totalCalls.delta ?? 0) >= 0,
    },
    {
      label: t.kpiResolutionRate,
      value: resolutionValue,
      deltaText: resolutionDelta,
      deltaGood: (result.resolutionRate.delta ?? 0) >= 0,
    },
    {
      label: t.kpiFollowUp,
      value: result.followUp.value.toLocaleString("tr-TR"),
      deltaText: result.followUp.delta != null ? formatTrPercent(result.followUp.delta, { signed: true }) : undefined,
      deltaGood: (result.followUp.delta ?? 0) <= 0,
    },
    {
      label: t.kpiNegativeCaller,
      value: result.negativeCaller.value.toLocaleString("tr-TR"),
      deltaText: result.negativeCaller.delta != null ? formatTrPercent(result.negativeCaller.delta, { signed: true }) : undefined,
      deltaGood: (result.negativeCaller.delta ?? 0) <= 0,
    },
  ]);

  // ---- Trend ----
  y = sectionTitle(doc, y, result.range === "all" ? t.monthlyTrend : t.dailyTrend);
  y = drawTrendChart(doc, y, result.dailyTrend, result.range === "all");

  // ---- Category (bar) ----
  y = sectionTitle(doc, y, t.byCategory);
  y = drawBarChart(doc, y, result.byCategory, { maxRows: 10 });

  // ---- Sentiment (pie) ----
  y = sectionTitle(doc, y, t.bySentiment);
  y = drawPieChart(doc, y, result.bySentiment);

  // ---- Resolution (pie) ----
  y = sectionTitle(doc, y, t.byResolution);
  y = drawPieChart(doc, y, result.byResolution);

  // ---- Agent (bar) ----
  y = sectionTitle(doc, y, `${t.byAgent} — ${t.topNAgents(Math.min(10, result.byAgent.length))}`);
  y = drawBarChart(doc, y, result.byAgent, { maxRows: 10 });

  // ---- Top tags ----
  if (result.topTags.length > 0) {
    y = sectionTitle(doc, y, t.topTags);
    y = ensureSpace(doc, y, 10);
    doc.setFont("NotoSans", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_RGB);
    const tagsLine = result.topTags.map((tag) => `${tag.label} (${tag.value.toLocaleString("tr-TR")})`).join("   ·   ");
    const wrapped = doc.splitTextToSize(tagsLine, CONTENT_WIDTH);
    for (const line of wrapped) {
      y = ensureSpace(doc, y, 5.5);
      doc.text(line, MARGIN, y);
      y += 5.5;
    }
  }

  addPageNumbers(doc);
  return doc;
}

export function downloadSummaryPdf(result: SummaryResult, rangeLabel: string) {
  const doc = renderSummaryPdf(result, rangeLabel);
  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`ozet-${stamp}.pdf`);
}
