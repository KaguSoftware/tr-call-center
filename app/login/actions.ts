"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

// In-memory per-instance limiter. Good enough to stop naive brute force on
// this internal tool; not a substitute for a shared store across instances.
const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function login(
  email: string,
  password: string
): Promise<{ error: "rate_limited" | "invalid" | null }> {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(`${ip}:${email}`)) {
    return { error: "rate_limited" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "invalid" };
  }

  return { error: null };
}
