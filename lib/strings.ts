// All UI strings in Turkish, centralized for easy editing / future i18n.
export const t = {
  appName: "Çağrı Merkezi Analizi",
  appShort: "Çağrı Analizi",

  // Nav
  navDashboard: "Panel",
  navSummary: "Özet",
  navUpload: "Çağrı Yükle",
  navLogout: "Çıkış",

  // Summary page
  summaryTitle: "Genel Özet",
  summarySubtitle: "Seçili aralıktaki çağrılara genel bakış",
  rangeToday: "Bugün",
  range7d: "7 gün",
  range30d: "30 gün",
  rangeAll: "Tümü",
  kpiTotal: "Toplam çağrı",
  kpiResolutionRate: "Çözüm oranı",
  kpiFollowUp: "Takip gerekiyor",
  kpiNegativeCaller: "Memnuniyetsiz arayanlar",
  vsPrevious: "önceki aralığa göre",
  byCategory: "Kategoriye göre",
  byAgent: "Temsilciye göre",
  bySentiment: "Arayan duygu durumu",
  byResolution: "Çözüm durumu",
  topTags: "En sık etiketler",
  dailyTrend: "Günlük eğilim",
  monthlyTrend: "Aylık eğilim",
  noCallsInRange: "Bu aralıkta çağrı kaydı yok",
  inFlight: (n: number) => `${n.toLocaleString("tr-TR")} işleniyor`,
  noAgent: "Temsilci yok",
  noCategory: "Kategori yok",
  unknownBucket: "Belirsiz",
  topNAgents: (n: number) => `En iyi ${n.toLocaleString("tr-TR")} temsilci`,

  // Login
  loginTitle: "Sisteme Giriş",
  loginSubtitle: "Panele erişmek için giriş yapın",
  email: "E-posta",
  password: "Parola",
  loginBtn: "Giriş",
  loggingIn: "Giriş yapılıyor…",
  loginError: "E-posta veya parola hatalı",
  loginRateLimited: "Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.",

  // Upload
  uploadTitle: "Çağrı Ses Dosyası Yükle",
  uploadHint: "Ses dosyası (mp3, wav, m4a, ogg) — dosya başına en fazla 20 MB",
  uploadHintMulti: "Aynı anda birden fazla dosya seçebilirsiniz",
  chooseFile: "Dosya seç",
  dropHere: "Dosyaları buraya bırakın veya tıklayın",
  upload: "Yükle ve analiz et",
  uploadOne: "1 dosya yükle",
  uploadMany: (n: number) => `${n.toLocaleString("tr-TR")} dosya yükle`,
  uploading: "Yükleniyor…",
  uploadSuccess: "Çağrı başarıyla yüklendi. Analiz ediliyor…",
  uploadSuccessMany: (n: number) => `${n.toLocaleString("tr-TR")} dosya yüklendi. Analiz başladı.`,
  uploadError: "Yükleme hatası",
  uploadErrorSome: (n: number) => `${n.toLocaleString("tr-TR")} dosyada hata oluştu`,
  fileTooLarge: "Dosya boyutu izin verilenden büyük (en fazla 20 MB)",
  invalidFileType: "Geçersiz dosya türü",
  filesQueued: (n: number) => `${n.toLocaleString("tr-TR")} dosya sırada`,
  removeAll: "Tümünü kaldır",
  add: "Ekle",
  status_queued: "Beklemede",
  status_uploading: "Yükleniyor",
  status_done: "Yüklendi",
  status_error: "Hata",

  // Dashboard
  dashboardTitle: "Çağrılar",
  dashboardSubtitle: "Analiz edilen çağrıların listesi",
  newUpload: "Yeni yükleme",
  noCalls: "Çağrı bulunamadı",
  loading: "Yükleniyor…",

  // Filters
  filters: "Filtreler",
  search: "Metin, özet veya isimlerde ara…",
  fromDate: "Başlangıç tarihi",
  toDate: "Bitiş tarihi",
  agent: "Temsilci",
  allAgents: "Tüm temsilciler",
  resolvedFilter: "Çözüm durumu",
  allStatuses: "Tümü",
  resolvedOnly: "Çözüldü",
  unresolvedOnly: "Çözülmedi",
  category: "Kategori",
  allCategories: "Tüm kategoriler",
  sentiment: "Duygu durumu",
  allSentiments: "Tümü",
  positive: "Olumlu",
  neutral: "Nötr",
  negative: "Olumsuz",
  clearFilters: "Filtreleri temizle",

  // Table headers
  thDate: "Tarih",
  thCaller: "Arayan",
  thAgent: "Temsilci",
  thIssue: "Konu",
  thCategory: "Kategori",
  thResolved: "Çözüldü mü?",
  thSentiment: "Duygu",
  thStatus: "Durum",

  // Status
  statusPending: "Sırada",
  statusTranscribing: "Deşifre ediliyor",
  statusAnalyzing: "Analiz ediliyor",
  statusDone: "Hazır",
  statusFailed: "Başarısız",

  // Queue / progress
  queuePosition: (pos: number, total: number) =>
    `${total.toLocaleString("tr-TR")} kayıttan ${pos.toLocaleString("tr-TR")}. sırada`,
  elapsed: "Geçen süre",
  eta: "Tahmini süre",
  etaUnknown: "Belirsiz",
  processingHint: "Yapay zekâ ile analiz ediliyor — bu sayfa canlı olarak güncellenir.",
  queuedHint: "Bu çağrı beklemede; sıra geldiğinde analiz otomatik başlar.",
  basedOnRecent: "Son çağrıların ortalamasına göre",

  // Resolved
  resolvedYes: "Evet",
  resolvedNo: "Hayır",
  resolvedUnknown: "Belirsiz",

  // Detail
  callDetail: "Çağrı detayı",
  audio: "Ses dosyası",
  transcript: "Görüşme metni",
  extracted: "Çıkarılan bilgiler",
  callerName: "Arayan adı",
  callerPhone: "Telefon numarası",
  agentName: "Temsilci adı",
  issueSummary: "Konu özeti",
  agentBehavior: "Temsilci davranışı",
  callerBehavior: "Arayan davranışı",
  agentSentiment: "Temsilci duygu durumu",
  callerSentiment: "Arayan duygu durumu",
  followUp: "Takip gerekiyor",
  yes: "Evet",
  no: "Hayır",
  notes: "Ek notlar",
  tags: "Etiketler",
  reprocess: "Yeniden analiz et",
  reprocessing: "Yeniden analiz ediliyor…",
  back: "Geri",
  delete: "Sil",
  deleting: "Siliniyor…",
  confirmDelete: "Bu çağrı kalıcı olarak silinsin mi?",
  cancel: "İptal",
  cancelling: "İptal ediliyor…",
  cancelled: "Kullanıcı tarafından iptal edildi",
  unknown: "—",
  errorOccurred: "İşleme hatası",

  // Bulk actions
  retryAllFailed: (n: number) => `Tüm başarısızları yeniden analiz et (${n.toLocaleString("tr-TR")})`,
  stopAllProcessing: (n: number) => `Tümünü durdur (${n.toLocaleString("tr-TR")})`,
  confirmRetryAll: "Tüm başarısız çağrılar yeniden analiz edilsin mi?",
  confirmRetryAllMsg: "Hatayla durmuş tüm çağrılar yeniden analiz sırasına eklenir.",
  confirmStopAll: "İşlenen tüm çağrılar durdurulsun mu?",
  confirmStopAllMsg: "Sırada veya analiz aşamasındaki çağrılar iptal edilir. Bu işlem geri alınamaz (ancak analizi yeniden başlatabilirsiniz).",
  bulkRetried: (n: number) => `${n.toLocaleString("tr-TR")} çağrı analiz sırasına eklendi`,
  bulkCancelled: (n: number) => `${n.toLocaleString("tr-TR")} çağrı iptal edildi`,
  reprocessSentiment: (n: number) => `Duygu analizini yenile (${n.toLocaleString("tr-TR")})`,
  confirmReprocessSentiment: "Tamamlanmış tüm çağrılar yeniden analiz edilsin mi?",
  confirmReprocessSentimentMsg: "Tüm tamamlanmış çağrılar yapay zekâ ile yeniden analiz edilir. Bu, zaman alabilir ve ek işlem maliyeti oluşturur.",
  bulkReprocessed: (n: number) => `${n.toLocaleString("tr-TR")} çağrı yeniden analiz sırasına eklendi`,
  downloadPdf: "PDF olarak indir",
  downloadExcel: "Excel olarak indir",
  aiBusyTitle: "Yapay zekâ servisi geçici olarak yoğun",
  aiBusyBody: "Çağrılar beklemede kalır ve servis kullanılabilir olduğunda analiz otomatik olarak kaldığı yerden devam eder.",
  aiBusyNextRetry: (mmss: string) => `Sonraki deneme: ${mmss} sonra`,
  aiBusyRetryingNow: "Yeniden deneniyor…",
  aiBusyRetryNow: "Hemen yeniden dene",

  // Realtime / connection
  connectionLive: "Canlı bağlantı",
  connectionLost: "Bağlantı kesildi",
  connectionReconnecting: "Bağlanıyor…",
  connectionLostToast: "Canlı bağlantı kesildi — güncellemeler durdu",
  connectionRestoredToast: "Canlı bağlantı yeniden kuruldu",
  lastSync: (mmss: string) => `Son güncelleme: ${mmss} önce`,
  justNow: "az önce",

  // Processing phases (derived from elapsed time)
  phaseDownloading: "Ses dosyası indiriliyor…",
  phaseAnalyzing: "Yapay zekâ ile analiz ediliyor…",
  phaseFinalizing: "Tamamlanıyor…",

  // Upload progress
  uploadingProgress: (percent: number, throughput: string) =>
    `%${percent.toLocaleString("tr-TR")} · ${throughput}`,
  uploadBatchETA: (mmss: string) => `Kalan süre: ${mmss}`,
  uploadBatchProgress: (done: number, total: number) =>
    `${total.toLocaleString("tr-TR")} dosyadan ${done.toLocaleString("tr-TR")} yüklendi`,
  throughputKbps: (kb: number) => `${kb.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} KB/sn`,
  throughputMbps: (mb: number) => `${mb.toLocaleString("tr-TR", { maximumFractionDigits: 1 })} MB/sn`,

  // Background notifications
  notifyCallDone: (name: string) =>
    name ? `«${name}» çağrısının analizi tamamlandı` : "Çağrı analizi tamamlandı",
  notifyCallFailed: (name: string) =>
    name ? `«${name}» çağrısının analizi hatayla durdu` : "Analiz hatayla durdu",
  notifyAIRecovered: "Yapay zekâ servisi geri geldi — sıra kaldığı yerden devam etti",

  // Inline actions
  inlineRetry: "Yeniden dene",
  queuedShort: "Sırada…",
  pendingShort: "Devam ediyor…",
} as const;

export function statusLabel(s: string): string {
  switch (s) {
    case "pending": return t.statusPending;
    case "transcribing": return t.statusTranscribing;
    case "analyzing": return t.statusAnalyzing;
    case "done": return t.statusDone;
    case "failed": return t.statusFailed;
    default: return s;
  }
}

export function sentimentLabel(s: string | null | undefined): string {
  switch (s) {
    case "positive": return t.positive;
    case "neutral": return t.neutral;
    case "negative": return t.negative;
    default: return t.unknown;
  }
}

export function resolvedLabel(r: boolean | null | undefined): string {
  if (r === true) return t.resolvedYes;
  if (r === false) return t.resolvedNo;
  return t.resolvedUnknown;
}

// Turkish-formatted date with time.
export function formatTrDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return d.toISOString();
  }
}

// Strip inline timestamp markers the model sometimes adds to transcripts
// (e.g. "[00:12]", "(01:23:45)", "00:12 -"), which read as noise rather than
// useful structure since we don't render a synced audio-position UI.
const TIMESTAMP_PATTERN = /^\s*[[(]?\d{1,2}:\d{2}(?::\d{2})?[\])]?\s*[-–—:]?\s*/;
export function cleanTranscript(transcript: string): string {
  return transcript
    .split("\n")
    .map((line) => line.replace(TIMESTAMP_PATTERN, ""))
    .join("\n");
}

// Just the date portion (no time) — used for summary range headers.
export function formatTrDateShort(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  try {
    return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

// Day-of-month label for daily-trend tooltips (e.g. "12 Haz").
export function formatTrDayMonth(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  try {
    return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

export function formatTrPercent(fraction: number, opts: { signed?: boolean } = {}): string {
  const pct = Math.round(fraction * 100);
  // Turkish convention places the percent sign before the number (e.g. %12, -%5, +%3).
  let sign = "";
  if (pct < 0) sign = "-";
  else if (opts.signed && pct > 0) sign = "+";
  return `${sign}%${Math.abs(pct).toLocaleString("tr-TR")}`;
}

// "0:23" or "1:05" for elapsed/ETA timers. Caps display at 99:59 for sanity.
export function formatTrDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.min(99, Math.floor(s / 60));
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
