import JSZip from "jszip";
import type { Call } from "@/lib/supabase/types";
import { callPdfFilename, renderCallPdf } from "@/lib/pdf-export";

export async function downloadCallsAsZip(calls: Call[]): Promise<void> {
  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (const call of calls) {
    const doc = renderCallPdf(call);
    const bytes = doc.output("arraybuffer");

    // Two selected calls can produce the same filename (same caller name);
    // disambiguate with a numeric suffix so nothing silently overwrites.
    let name = callPdfFilename(call);
    if (usedNames.has(name)) {
      const base = name.replace(/\.pdf$/, "");
      let i = 2;
      while (usedNames.has(`${base}-${i}.pdf`)) i++;
      name = `${base}-${i}.pdf`;
    }
    usedNames.add(name);

    zip.file(name, bytes);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const stamp = new Date().toISOString().slice(0, 10);
  a.download = `cagrilar-${stamp}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
