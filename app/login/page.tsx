import { LoginForm } from "./login-form";
import { FadeIn } from "@/components/motion";
import { t } from "@/lib/strings";

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand hero (left on large screens) */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden brand-mark p-10 text-white">
        {/* soft decorative blobs */}
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-black/10 blur-2xl" />

        <div className="relative flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center font-bold text-lg">
            Ç
          </div>
          <span className="font-semibold">{t.appShort}</span>
        </div>

        <div className="relative">
          <h2 className="text-3xl font-bold leading-snug max-w-sm">{t.appName}</h2>
          <p className="text-white/80 mt-3 max-w-sm leading-relaxed">{t.summarySubtitle}</p>
        </div>

        <div className="relative text-white/60 text-sm">© {new Date().getFullYear()} {t.appShort}</div>
      </div>

      {/* Form (right) */}
      <div className="flex items-center justify-center px-6 py-12 auth-bg">
        <FadeIn className="w-full max-w-sm">
          {/* compact brand mark for mobile / small screens */}
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl brand-mark font-bold text-xl mb-4 shadow-soft">
              Ç
            </div>
          </div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">{t.loginTitle}</h1>
            <p className="text-muted text-sm mt-1.5">{t.loginSubtitle}</p>
          </div>
          <div className="panel p-6">
            <LoginForm />
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
