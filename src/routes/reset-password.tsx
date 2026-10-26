import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shell, PageHeader, Btn } from "@/components/shell";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Set a new password — Cyber Race" },
    { name: "description", content: "Choose a new password for your Cyber Race account." },
    { property: "og:title", content: "Reset password — Cyber Race" },
    { property: "og:description", content: "Choose a new password for your account." },
  ] }),
  component: Reset,
});

function Reset() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((e) => { if (e === "PASSWORD_RECOVERY" || e === "SIGNED_IN") setReady(true); });
    if (window.location.hash.includes("type=recovery")) setReady(true);
    return () => data.subscription.unsubscribe();
  }, []);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) return setMsg(error.message);
    navigate({ to: "/dashboard", replace: true });
  }
  return (
    <Shell>
      <div className="mx-auto max-w-md">
        <PageHeader eyebrow="Account recovery" title="Set a new password" />
        {!ready ? <p className="panel p-6 text-sm text-muted-foreground">Open this page from the reset link in your email.</p> : (
          <form onSubmit={save} className="panel space-y-4 p-6">
            <label className="block text-sm">New password<input className="w-full rounded-lg border border-border bg-input/40 px-3 py-2 text-sm" type="password" minLength={8} required autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /></label>
            {msg && <p className="text-sm text-destructive">{msg}</p>}
            <Btn type="submit" className="w-full">Save password</Btn>
          </form>
        )}
      </div>
    </Shell>
  );
}
