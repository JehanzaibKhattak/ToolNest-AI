"use client";
import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
type Mode = "login" | "register" | "forgot";
export function AuthForm({ mode }: { mode: Mode }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  async function submit(formData: FormData) {
    setLoading(true);
    setError("");
    try {
      const supabase = createSupabaseBrowser();
      const email = String(formData.get("email"));
      const password = String(formData.get("password"));
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/auth/callback?next=/dashboard/account`,
        });
        if (error) throw error;
        setError("Check your inbox for a reset link.");
        return;
      }
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: String(formData.get("fullName")),
              emailRedirectTo: `${location.origin}/auth/callback`,
            },
          },
        });
        if (error) throw error;
        setError(
          "Account created. Check your inbox if email confirmation is enabled.",
        );
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }
  return (
    <form action={submit} className="card grid gap-5 p-7">
      {mode === "register" && (
        <label className="grid gap-2">
          <span>Full name</span>
          <input
            name="fullName"
            required
            className="field"
            autoComplete="name"
          />
        </label>
      )}
      <label className="grid gap-2">
        <span>Email</span>
        <input
          name="email"
          type="email"
          required
          className="field"
          autoComplete="email"
        />
      </label>
      {mode !== "forgot" && (
        <label className="grid gap-2">
          <span>Password</span>
          <input
            name="password"
            type="password"
            minLength={8}
            required
            className="field"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
          />
        </label>
      )}
      <button disabled={loading} className="btn btn-primary">
        {loading
          ? "Please wait…"
          : mode === "login"
            ? "Log in"
            : mode === "register"
              ? "Create account"
              : "Send reset link"}
      </button>
      {error && (
        <p role="status" className="text-sm text-amber-400">
          {error}
        </p>
      )}
      {mode === "login" && (
        <div className="flex justify-between text-sm">
          <Link href="/register">Create account</Link>
          <Link href="/forgot-password">Forgot password?</Link>
        </div>
      )}
      {mode === "register" && (
        <Link className="text-sm" href="/login">
          Already have an account? Log in
        </Link>
      )}
    </form>
  );
}
