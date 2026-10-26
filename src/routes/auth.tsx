import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Shell, PageHeader, Btn } from "@/components/shell";
import { safeRedirect } from "@/lib/safe-redirect";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ redirect: z.string().optional(), mode: z.enum(["signin", "signup", "forgot"]).optional(), expired: z.boolean().optional() }),
  head: () => ({ meta: [
    { title: "Sign in — Cyber Race" },
    { name: "description", content: "Sign in or create your private Cyber Race account." },
    { property: "og:title", content: "Sign in — Cyber Race" },
    { property: "og:description", content: "Private, invitation-based Cyber Race accounts." },
  ] }),
  component: AuthPage,
});

const input = "w-full rounded-lg border border-border bg-input/40 px-3 py-2 text-sm";

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const to = safeRedirect(search.redirect);
  const [mode, setMode] = useState(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to, replace: true }); });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to, replace: true });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + to } });
        if (error) throw error;
        setMsg({ ok: true, text: "Check your email to confirm your account, then sign in." });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setMsg({ ok: true, text: "If that email has an account, a reset link is on its way." });
      }
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Something went wrong." });
    } finally { setBusy(false); }
  }

  return (
    <Shell>
      <div className="mx-auto max-w-md">
        <PageHeader eyebrow="Private accounts" title={mode === "signin" ? "Sign in" : mode === "signup" ? "Create your account" : "Reset password"}>
          {search.expired ? "Your session ended. Please sign in again." : "Access is invitation-based. Creating an account alone does not grant access."}
        </PageHeader>
        <form onSubmit={submit} className="panel space-y-4 p-6">
          <label className="block text-sm">Email<input className={input} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          {mode !== "forgot" && (
            <label className="block text-sm">Password<input className={input} type="password" required minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          )}
          {msg && <p role="status" className={`text-sm ${msg.ok ? "text-success" : "text-destructive"}`}>{msg.text}</p>}
          <Btn type="submit" disabled={busy} className="w-full">{mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}</Btn>
          <div className="flex justify-between text-sm">
            {mode !== "signin" ? <button type="button" className="text-primary" onClick={() => setMode("signin")}>Back to sign in</button>
              : <button type="button" className="text-primary" onClick={() => setMode("forgot")}>Forgot password?</button>}
            {mode !== "signup" && <button type="button" className="text-primary" onClick={() => setMode("signup")}>Create account</button>}
          </div>
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground"><Link to="/" className="hover:underline">Back to home</Link></p>
      </div>
    </Shell>
  );
}
