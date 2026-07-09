import * as XLSX from "xlsx";
import type { SummaryResult } from "@/lib/summary";
import type { Call } from "@/lib/supabase/types";
import { formatTrDate, formatTrDateShort, formatTrPercent, resolvedLabel, sentimentLabel, statusLabel, t } from "@/lib/strings";

function autoWidth(rows: (string | number)[][]): { wch: number }[] {
  const widths: number[] = [];
  for (const row of rows) {
    row.forEach((cell, i) => {
      const len = String(cell ?? "").length;
      widths[i] = Math.max(widths[i] ?? 10, Math.min(len + 2, 50));
    });
  }
  return widths.map((w) => ({ wch: w }));
}

function sheetFromRows(rows: (string | number)[][]): XLSX.WorkSheet {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = autoWidth(rows);
  return ws;
}

export function downloadSummaryExcel(result: SummaryResult, rangeLabel: string) {
  const wb = XLSX.utils.book_new();

  // ---- Sheet 1: Özet (KPIs) ----
  const resolutionValue =
    result.resolutionRate.value === null ? "—" : formatTrPercent(result.resolutionRate.value);
  const summaryRows: (string | number)[][] = [
    [t.summaryTitle],
    [rangeLabel],
    [],
    [t.kpiTotal, result.totalCalls.value],
    [t.kpiResolutionRate, resolutionValue],
    [t.kpiFollowUp, result.followUp.value],
    [t.kpiNegativeCaller, result.negativeCaller.value],
    [t.inFlight(result.inFlightCount), result.inFlightCount],
  ];
  XLSX.utils.book_append_sheet(wb, sheetFromRows(summaryRows), "Özet");

  // ---- Sheet 2: Kategori ----
  const catRows: (string | number)[][] = [
    [t.byCategory, t.kpiTotal],
    ...result.byCategory.map((b) => [b.label, b.value]),
  ];
  XLSX.utils.book_append_sheet(wb, sheetFromRows(catRows), "Kategori");

  // ---- Sheet 3: Temsilci ----
  const agentRows: (string | number)[][] = [
    [t.byAgent, t.kpiTotal, t.thResolved],
    ...result.byAgent.map((b) => [b.label, b.value, b.secondary ?? "—"]),
  ];
  XLSX.utils.book_append_sheet(wb, sheetFromRows(agentRows), "Temsilci");

  // ---- Sheet 4: Duygu ----
  const sentRows: (string | number)[][] = [
    [t.bySentiment, t.kpiTotal],
    ...result.bySentiment.map((b) => [b.label, b.value]),
  ];
  XLSX.utils.book_append_sheet(wb, sheetFromRows(sentRows), "Duygu");

  // ---- Sheet 5: Çözüm Durumu ----
  const resRows: (string | number)[][] = [
    [t.byResolution, t.kpiTotal],
    ...result.byResolution.map((b) => [b.label, b.value]),
  ];
  XLSX.utils.book_append_sheet(wb, sheetFromRows(resRows), "Çözüm Durumu");

  // ---- Sheet 6: Etiketler ----
  const tagRows: (string | number)[][] = [
    [t.topTags, t.kpiTotal],
    ...result.topTags.map((b) => [b.label, b.value]),
  ];
  XLSX.utils.book_append_sheet(wb, sheetFromRows(tagRows), "Etiketler");

  // ---- Sheet 7: Günlük Trend ----
  const trendLabel = result.range === "all" ? t.monthlyTrend : t.dailyTrend;
  const trendRows: (string | number)[][] = [
    [trendLabel, t.kpiTotal],
    ...result.dailyTrend.map((d) => [
      result.range === "all" ? d.date : formatTrDateShort(d.date),
      d.count,
    ]),
  ];
  XLSX.utils.book_append_sheet(wb, sheetFromRows(trendRows), "Günlük Trend");

  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `ozet-${stamp}.xlsx`);
}

export function downloadCallsExcel(calls: Call[]) {
  const rows: (string | number)[][] = [
    [t.thDate, t.callerName, t.callerPhone, t.agentName, t.thIssue, t.thCategory, t.thResolved, t.followUp, t.callerSentiment, t.agentSentiment, t.thStatus],
    ...calls.map((c) => [
      formatTrDate(c.created_at),
      c.caller_name || "—",
      c.caller_phone || "—",
      c.agent_name || "—",
      c.issue_summary || "—",
      c.category || "—",
      resolvedLabel(c.resolved),
      c.follow_up_needed === true ? t.yes : c.follow_up_needed === false ? t.no : "—",
      sentimentLabel(c.sentiment_caller),
      sentimentLabel(c.sentiment_agent),
      statusLabel(c.status),
    ]),
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheetFromRows(rows), "Çağrılar");

  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `cagrilar-${stamp}.xlsx`);
}
