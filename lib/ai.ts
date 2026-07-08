import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";

const MODEL = "gemini-2.5-flash-lite";

const PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION ?? "us-central1";

// Lazy client: don't crash at module-eval time (e.g. during `next build` page
// data collection) if the env var is missing. Throw only when actually used.
let _client: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (_client) return _client;

  // Fallback: plain Gemini Developer API key. Used while Vertex AI billing
  // is still being set up on the GCP project — drop once Vertex is live.
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    _client = new GoogleGenAI({ apiKey });
    return _client;
  }

  const inlineJson = process.env.GOOGLE_CREDENTIALS_JSON;
  const credFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!inlineJson && !credFile) {
    throw new Error(
      "Vertex AI kimlik doğrulaması yapılandırılmadı: GOOGLE_CREDENTIALS_JSON (Vercel'de) veya GOOGLE_APPLICATION_CREDENTIALS (yerelde) değişkenini ayarlayın."
    );
  }

  if (!PROJECT) {
    throw new Error("GOOGLE_CLOUD_PROJECT ayarlanmadı.");
  }

  const opts: ConstructorParameters<typeof GoogleGenAI>[0] = {
    vertexai: true,
    project: PROJECT,
    location: LOCATION,
  };

  if (inlineJson) {
    const credentials = JSON.parse(inlineJson);
    opts.googleAuthOptions = { credentials };
  }

  _client = new GoogleGenAI(opts);
  return _client;
}

// ===== Schema (used both by Gemini's responseSchema and Zod validation) =====

export const AnalysisSchema = z.object({
  transcript: z.string(),
  caller_name: z.string().nullable(),
  caller_phone: z.string().nullable(),
  agent_name: z.string().nullable(),
  issue_summary: z.string(),
  resolved: z.boolean().nullable(),
  category: z.string(),
  tags: z.array(z.string()),
  agent_behavior: z.string(),
  caller_behavior: z.string(),
  sentiment_agent: z.enum(["positive", "neutral", "negative"]),
  sentiment_caller: z.enum(["positive", "neutral", "negative"]),
  follow_up_needed: z.boolean(),
  notes: z.string(),
});

export type Analysis = z.infer<typeof AnalysisSchema>;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    transcript: { type: Type.STRING, description: "Görüşmenin Türkçe tam metni; her iki tarafın söylediklerini zaman sırasına göre içerir" },
    caller_name: { type: Type.STRING, nullable: true, description: "Görüşmede geçtiyse arayanın adı" },
    caller_phone: { type: Type.STRING, nullable: true, description: "Belirtildiyse arayanın telefon numarası" },
    agent_name: { type: Type.STRING, nullable: true, description: "Belirtildiyse çağrı merkezi temsilcisinin adı" },
    issue_summary: { type: Type.STRING, description: "Çağrı konusunun bir-iki cümlelik Türkçe özeti" },
    resolved: { type: Type.BOOLEAN, nullable: true, description: "Sorun bu çağrıda çözüldü mü? Belirsizse null" },
    category: { type: Type.STRING, description: "Kategori: Finans, Teknik, Şikayet, Bilgi, Satış, Destek veya Diğer" },
    tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Birkaç kısa Türkçe etiket" },
    agent_behavior: { type: Type.STRING, description: "Temsilcinin davranışının kısa Türkçe açıklaması" },
    caller_behavior: { type: Type.STRING, description: "Arayanın davranışının kısa Türkçe açıklaması" },
    sentiment_agent: {
      type: Type.STRING,
      enum: ["positive", "neutral", "negative"],
      description: "Temsilcinin ton ve tavrı. positive: nazik, yardımsever, güler yüzlü; negative: sabırsız, kaba, ilgisiz veya sinirli; neutral: sadece işlevsel/bilgilendirici, belirgin bir duygusal ton yok. Sesteki gerçek tona göre değerlendir, varsayılan olarak neutral seçme.",
    },
    sentiment_caller: {
      type: Type.STRING,
      enum: ["positive", "neutral", "negative"],
      description: "Arayanın ton ve tavrı. positive: memnun, teşekkür eden, dostane; negative: sinirli, hayal kırıklığına uğramış, şikayetçi veya sabırsız; neutral: sadece bilgi almak/vermek amaçlı, belirgin bir duygusal ton yok. Sesteki gerçek tona göre değerlendir, varsayılan olarak neutral seçme.",
    },
    follow_up_needed: { type: Type.BOOLEAN },
    notes: { type: Type.STRING, description: "Dikkat çeken diğer notlar (Türkçe)" },
  },
  required: [
    "transcript", "caller_name", "caller_phone", "agent_name",
    "issue_summary", "resolved", "category", "tags",
    "agent_behavior", "caller_behavior",
    "sentiment_agent", "sentiment_caller",
    "follow_up_needed", "notes",
  ],
  propertyOrdering: [
    "transcript", "caller_name", "caller_phone", "agent_name",
    "issue_summary", "resolved", "category", "tags",
    "agent_behavior", "caller_behavior",
    "sentiment_agent", "sentiment_caller",
    "follow_up_needed", "notes",
  ],
};

const SYSTEM_INSTRUCTION = `Sen bir çağrı merkezi görüşme analistisin.
Sana bir çağrı merkezi temsilcisi ile bir müşteri arasındaki Türkçe bir çağrının ses dosyası verilir.

İki görevin var:
1. Tüm görüşmeyi dikkatle Türkçe olarak deşifre et (transcript). İki tarafın söylediklerini zaman sırasına göre yaz.
2. Görüşmeden yapılandırılmış bilgileri çıkar.

Önemli notlar:
- Tüm metin değerleri Türkçe olmalıdır.
- Kendinden bir şey ekleme; yalnızca sesin gerçek içeriğine göre yanıt ver.
- Bilgi seste yoksa, nullable alanlar için null kullan.
- Sorunun çözülüp çözülmediği belirsizse resolved alanını null bırak.
- sentiment_agent ve sentiment_caller için sesteki gerçek tonu (kelime seçimi, ses tonu, sabır/sabırsızlık, teşekkür/şikayet ifadeleri) dikkatle değerlendir. Bu alanlarda "neutral" yalnızca gerçekten belirgin bir duygusal ton yoksa kullanılmalı; çoğu çağrıda taraflardan en az biri açıkça memnun ya da rahatsız olur, bunu yansıt.`;

// ===== Main entry: audio file → transcript + structured analysis =====

export type AnalyzeOptions = {
  // Original upload filename. Call-center recordings often encode the caller
  // number here (e.g. "09121234567.mp3"), so we surface it to the model.
  filenameHint?: string | null;
  // Phone already parsed from the filename. Use as a high-confidence default.
  phoneHint?: string | null;
};

// Thrown when Gemini is temporarily unavailable (503 UNAVAILABLE, 429 rate
// limit, network blips). Caller is expected to keep the row in `pending`
// and try again later rather than marking it `failed`.
export class TransientAIError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "TransientAIError";
  }
}

function isTransient(e: unknown): { transient: boolean; status?: number; message: string } {
  const message = e instanceof Error ? e.message : String(e);
  // The @google/genai SDK surfaces HTTP errors as Error with the JSON body
  // embedded in .message. Cheap-and-cheerful detection from the string.
  const m = message.match(/"code"\s*:\s*(\d+)/);
  const status = m ? Number(m[1]) : undefined;
  // 5xx server-side issues + 429 rate limit + 408 request timeout.
  if (status === 503 || status === 429 || status === 500 || status === 504 || status === 408 || status === 502) {
    return { transient: true, status, message };
  }
  // Vertex/Gemini gRPC-style codes embedded in the JSON body, plus a few
  // wording variants we've seen in the wild from the Vertex backend.
  if (/UNAVAILABLE|RESOURCE_EXHAUSTED|DEADLINE_EXCEEDED|INTERNAL|ABORTED|CANCELLED|UPSTREAM|gateway timeout|server disconnected|socket hang up|stream closed|timeout/i.test(message)) {
    return { transient: true, status, message };
  }
  // Network-level errors (DNS, connection reset, fetch failure, TLS reset).
  if (e instanceof TypeError || /fetch failed|ECONNRESET|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|EPIPE|read ECONNRESET|other side closed|network|aborted/i.test(message)) {
    return { transient: true, status, message };
  }
  // Auth token refresh issues during long calls — these are transient.
  if (/invalid_grant|token has been expired|UNAUTHENTICATED|credentials/i.test(message)) {
    return { transient: true, status, message };
  }
  return { transient: false, status, message };
}

export async function analyzeAudio(
  file: File,
  options: AnalyzeOptions = {}
): Promise<{ analysis: Analysis }> {
  // Gemini's File API handles audio up to 2GB; for simplicity we use inline
  // (base64) audio which is fine up to ~20MB request size.
  const bytes = new Uint8Array(await file.arrayBuffer());
  const base64 = Buffer.from(bytes).toString("base64");

  const hintLines: string[] = [];
  if (options.filenameHint) {
    hintLines.push(`Orijinal dosya adı: «${options.filenameHint}»`);
  }
  if (options.phoneHint) {
    hintLines.push(
      `Dosya adından çıkarılan telefon numarası: ${options.phoneHint}. ` +
      `Görüşmede başka bir numara geçtiyse onu kullan; ` +
      `aksi halde bu numarayı caller_phone alanına yaz.`
    );
  }
  const userText = [
    hintLines.join("\n"),
    "Bu ses dosyasını deşifre edip analiz et ve çıktıyı belirtilen şemaya göre JSON olarak döndür.",
  ].filter(Boolean).join("\n\n");

  // Three in-process retries with backoff (1s, 3s, 6s) for short blips.
  // If it's still transient after that, throw TransientAIError so the
  // worker pauses the queue and the cron retries later. Extra attempts here
  // avoid bouncing the row back to `pending` for blips that resolve in
  // under 10 seconds — the cron only fires every minute.
  const delays = [1000, 3000, 6000];
  let lastErr: unknown;
  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      const response = await client().models.generateContent({
        model: MODEL,
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: file.type || "audio/mpeg",
                  data: base64,
                },
              },
              { text: userText },
            ],
          },
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          // Long calls produce large transcripts. Without an explicit cap the
          // JSON gets truncated mid-string ("Unterminated string in JSON"),
          // which JSON.parse can't recover from. Use the model's max output,
          // and disable thinking so reasoning tokens don't eat that budget.
          maxOutputTokens: 65536,
          thinkingConfig: { thinkingBudget: 0 },
        },
      });

      // If the model stopped because it ran out of output budget, the JSON is
      // truncated and unparseable. Surface a clear error instead of a cryptic
      // "Unterminated string in JSON". Treat as transient so the cron retries
      // (a re-run may stay under budget, and headroom is now much larger).
      const finishReason = response.candidates?.[0]?.finishReason;
      if (finishReason === "MAX_TOKENS") {
        throw new Error(
          "TRUNCATED_RESPONSE: Görüşme uzun olduğu için model yanıtı eksik döndü"
        );
      }

      const raw = response.text ?? "{}";
      // Empty response. Vertex occasionally returns this transiently
      // (content-filter false positives, partial streams). Treat as
      // transient so the cron retries — better than failing a real call.
      if (!raw || raw === "{}" || raw.trim().length === 0) {
        throw new Error("EMPTY_RESPONSE: Model bir yanıt döndürmedi");
      }
      const parsed = JSON.parse(raw);
      const analysis = AnalysisSchema.parse(parsed);
      return { analysis };
    } catch (e) {
      lastErr = e;
      const t = isTransient(e);
      // Empty- and truncated-response retries get folded into transient handling.
      const isEmpty = e instanceof Error && /EMPTY_RESPONSE|TRUNCATED_RESPONSE/.test(e.message);
      if (!t.transient && !isEmpty) throw e;
      if (attempt < delays.length) {
        console.warn(`[analyzeAudio] transient attempt ${attempt + 1} failed${t.status ? ` (${t.status})` : ""}: ${t.message.slice(0, 200)} — retrying in ${delays[attempt]}ms`);
        await new Promise((r) => setTimeout(r, delays[attempt]));
        continue;
      }
      throw new TransientAIError(
        humanizeTransientMessage(t),
        t.status,
      );
    }
  }
  // Unreachable, but TS needs it.
  throw lastErr instanceof Error ? lastErr : new Error("unknown");
}

// Translate the SDK's raw error into a Farsi message the dashboard can show
// to non-technical users. We don't want to leak HTTP bodies or stack
// fragments to the UI — those land in error_message which is rendered as-is.
function humanizeTransientMessage(t: { status?: number; message: string }): string {
  if (t.status === 429 || /RESOURCE_EXHAUSTED|rate.?limit|quota/i.test(t.message)) {
    return "Yapay zekâ servisi kullanım sınırına ulaştı. Yeniden deneme otomatik olarak yapılacak.";
  }
  if (t.status === 503 || /UNAVAILABLE|overloaded/i.test(t.message)) {
    return "Yapay zekâ servisi geçici olarak yoğun. Yeniden deneme otomatik olarak yapılacak.";
  }
  if (t.status === 504 || /DEADLINE_EXCEEDED|timeout|UPSTREAM/i.test(t.message)) {
    return "Yapay zekâ servisinin yanıtı zamanında gelmedi. Yeniden deneme otomatik olarak yapılacak.";
  }
  if (/EMPTY_RESPONSE/.test(t.message)) {
    return "Model bir yanıt döndürmedi. Yeniden deneme otomatik olarak yapılacak.";
  }
  if (/UNAUTHENTICATED|invalid_grant|credentials|token/i.test(t.message)) {
    return "Kimlik doğrulama geçici olarak başarısız oldu. Yeniden deneme otomatik olarak yapılacak.";
  }
  return `Yapay zekâ servisi geçici olarak kullanılamıyor${t.status ? ` (${t.status})` : ""}. Yeniden deneme otomatik olarak yapılacak.`;
}
