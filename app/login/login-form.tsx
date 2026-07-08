"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "./actions";
import { t } from "@/lib/strings";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await login(email, password);
    setLoading(false);
    if (error === "rate_limited") {
      setError(t.loginRateLimited);
      return;
    }
    if (error) {
      setError(t.loginError);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm mb-1.5 text-muted">{t.email}</label>
        <input
          type="email"
          required
          dir="ltr"
          className="input text-left"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <div>
        <label className="block text-sm mb-1.5 text-muted">{t.password}</label>
        <input
          type="password"
          required
          dir="ltr"
          className="input text-left"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      {error && (
        <div className="text-sm bg-red-50 border border-red-200 text-red-800 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full inline-flex items-center justify-center gap-1.5"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? t.loggingIn : t.loginBtn}
      </button>
    </form>
  );
}
