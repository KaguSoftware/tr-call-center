import { jsPDF } from "jspdf";
import type { Call } from "@/lib/supabase/types";
import {
  cleanTranscript,
  formatTrDate,
  resolvedLabel,
  sentimentLabel,
  statusLabel,
  t,
} from "@/lib/strings";
import { NOTO_SANS_BOLD_BASE64, NOTO_SANS_REGULAR_BASE64 } from "@/lib/fonts/noto-sans-base64";

const ACCENT_RGB: [number, number, number] = [46, 158, 143]; // brand teal-green
const MUTED_RGB: [number, number, number] = [100, 116, 139]; // slate-500
const TEXT_RGB: [number, number, number] = [15, 23, 42]; // slate-900
const BORDER_RGB: [number, number, number] = [226, 232, 240]; // slate-200
const LINK_RGB: [number, number, number] = [37, 99, 235]; // blue-600, speaker labels

const SPEAKER_LABEL = /^([^:\n]{1,30}:)(\s*)/;

const PAGE_WIDTH = 210; // A4 mm
const PAGE_HEIGHT = 297;
const MARGIN = 16;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function registerFont(doc: jsPDF) {
  // Every downloadCallPdf() call creates a brand new jsPDF instance, so the
  // font must be (re-)registered on each one — it doesn't carry over.
  doc.addFileToVFS("NotoSans-Regular.ttf", NOTO_SANS_REGULAR_BASE64);
  doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
  doc.addFileToVFS("NotoSans-Bold.ttf", NOTO_SANS_BOLD_BASE64);
  doc.addFont("NotoSans-Bold.ttf", "NotoSans", "bold");
  doc.setFont("NotoSans", "normal");
}

export function sanitizeFilename(s: string): string {
  return s.replace(/[^\p{L}\p{N}_-]+/gu, "_").slice(0, 60);
}

export function callPdfFilename(call: Call): string {
  const namePart = call.caller_name || call.caller_phone || call.id.slice(0, 8);
  return `cagri-${sanitizeFilename(namePart)}.pdf`;
}

// Builds the PDF document for a call without saving/downloading it — used
// both by the single-download path below and the bulk ZIP exporter
// (lib/zip-export.ts), which needs the raw bytes instead of a browser save.
export function renderCallPdf(call: Call): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  registerFont(doc);

  let y = MARGIN;

  // ---- Header ----
  doc.setFillColor(...ACCENT_RGB);
  doc.rect(0, 0, PAGE_WIDTH, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("NotoSans", "bold");
  doc.setFontSize(15);
  doc.text(t.appName, MARGIN, 13);
  doc.setFont("NotoSans", "normal");
  doc.setFontSize(9);
  doc.text(`${t.callDetail} — ${formatTrDate(call.created_at)}`, MARGIN, 19);
  y = 30;

  doc.setTextColor(...TEXT_RGB);

  // ---- Status line ----
  doc.setFontSize(9);
  doc.setTextColor(...MUTED_RGB);
  doc.text(`${t.thStatus}: ${statusLabel(call.status)}`, MARGIN, y);
  y += 8;

  // ---- Field grid ----
  const fields: Array<[string, string]> = [
    [t.callerName, call.caller_name || "—"],
    [t.callerPhone, call.caller_phone || "—"],
    [t.agentName, call.agent_name || "—"],
    [t.thCategory, call.category || "—"],
    [t.thResolved, resolvedLabel(call.resolved)],
    [t.followUp, call.follow_up_needed === true ? t.yes : call.follow_up_needed === false ? t.no : "—"],
    [t.agentSentiment, sentimentLabel(call.sentiment_agent)],
    [t.callerSentiment, sentimentLabel(call.sentiment_caller)],
  ];

  const colWidth = CONTENT_WIDTH / 2;
  fields.forEach(([label, value], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = MARGIN + col * colWidth;
    const rowY = y + row * 12;
    doc.setFontSize(8);
    doc.setTextColor(...MUTED_RGB);
    doc.text(label, x, rowY);
    doc.setFontSize(10.5);
    doc.setTextColor(...TEXT_RGB);
    doc.text(String(value), x, rowY + 5);
  });
  y += Math.ceil(fields.length / 2) * 12 + 4;

  y = drawSectionRule(doc, y);
  y = drawBlockField(doc, y, t.issueSummary, call.issue_summary);
  y = drawBlockField(doc, y, t.agentBehavior, call.agent_behavior);
  y = drawBlockField(doc, y, t.callerBehavior, call.caller_behavior);

  if (call.tags && call.tags.length > 0) {
    y = drawBlockField(doc, y, t.tags, call.tags.join(", "));
  }
  if (call.notes) {
    y = drawBlockField(doc, y, t.notes, call.notes);
  }

  // ---- Transcript (own section, paginated) ----
  y = drawSectionRule(doc, y);
  y = ensureSpace(doc, y, 12);
  doc.setFont("NotoSans", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...TEXT_RGB);
  doc.text(t.transcript, MARGIN, y);
  doc.setFont("NotoSans", "normal");
  y += 6;

  const transcript = call.transcript ? cleanTranscript(call.transcript) : t.unknown;
  const lineHeight = 5;
  doc.setFontSize(9.5);
  for (const rawLine of transcript.split("\n")) {
    const match = rawLine.match(SPEAKER_LABEL);
    if (!match) {
      const wrapped = doc.splitTextToSize(rawLine || " ", CONTENT_WIDTH);
      for (const w of wrapped) {
        y = ensureSpace(doc, y, lineHeight);
        doc.setTextColor(...TEXT_RGB);
        doc.text(w, MARGIN, y);
        y += lineHeight;
      }
      continue;
    }

    const [, label, space] = match;
    const rest = rawLine.slice(match[0].length);
    y = ensureSpace(doc, y, lineHeight);
    doc.setTextColor(...LINK_RGB);
    doc.text(label, MARGIN, y);
    const labelWidth = doc.getTextWidth(label + space);
    doc.setTextColor(...TEXT_RGB);

    const wrapped = doc.splitTextToSize(rest, CONTENT_WIDTH - labelWidth);
    wrapped.forEach((w: string, i: number) => {
      if (i > 0) y = ensureSpace(doc, y, lineHeight);
      doc.text(w, MARGIN + (i === 0 ? labelWidth : 0), y);
      if (i < wrapped.length - 1) y += lineHeight;
    });
    y += lineHeight;
  }

  addPageNumbers(doc);

  return doc;
}

export function downloadCallPdf(call: Call) {
  const doc = renderCallPdf(call);
  doc.save(callPdfFilename(call));
}

function drawBlockField(doc: jsPDF, y: number, label: string, value: string | null): number {
  if (!value) return y;
  y = ensureSpace(doc, y, 14);
  doc.setFont("NotoSans", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED_RGB);
  doc.text(label, MARGIN, y);
  y += 5;
  doc.setFont("NotoSans", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...TEXT_RGB);
  const lines = doc.splitTextToSize(value, CONTENT_WIDTH);
  const lineHeight = 5;
  for (const line of lines) {
    y = ensureSpace(doc, y, lineHeight);
    doc.text(line, MARGIN, y);
    y += lineHeight;
  }
  return y + 3;
}

function drawSectionRule(doc: jsPDF, y: number): number {
  y = ensureSpace(doc, y, 6);
  doc.setDrawColor(...BORDER_RGB);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  return y + 7;
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_HEIGHT - MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return y;
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
