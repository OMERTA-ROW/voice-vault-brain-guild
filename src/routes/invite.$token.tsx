import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { acceptInvite } from "@/lib/access.functions";
import { Shell, PageHeader, Btn } from "@/components/shell";

export const Route = createFileRoute("/invite/$token")({
  head: () => ({ meta: [
    { title: "Accept invitation — Cyber Race" },
    { name: "description", content: "Accept your private Cyber Race invitation." },
    { property: "og:title", content: "You're invited — Cyber Race" },
    { property: "og:description", content: "Accept your private Cyber Race invitation." },
    { name: "robots", content: "noindex" },
  ] }),
  component: Invite,
});

function Invite() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const accept = useServerFn(acceptInvite);
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  const [err, setErr] = useState("");
  const here = `/invite/${token}`;
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null)); }, []);

  async function go() {
    setErr("");
    const r = await accept({ data: { token } }).catch(() => ({ ok: false, error: "Could not accept invitation." }));
    if (r.ok) navigate({ to: "/dashboard" }); else setErr(r.error ?? "Could not accept invitation.");
  }

  return (
    <Shell>
      <div className="mx-auto max-w-md">
        <PageHeader eyebrow="Private invitation" title="Join Cyber Race">
          Invitations are single-use and tied to one email. You choose your own password.
        </PageHeader>
        <div className="panel space-y-4 p-6 text-sm">
          {email === undefined ? <p>Checking your session…</p> : email === null ? (
            <>
              <p>First create an account (or sign in) with the email this invite was sent for, confirm it, then come back to this link.</p>
              <div className="flex gap-2">
                <Link to="/auth" search={{ mode: "signup", redirect: here }} className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">Create account</Link>
                <Link to="/auth" search={{ redirect: here }} className="rounded-lg border border-border px-4 py-2">Sign in</Link>
              </div>
            </>
          ) : (
            <>
              <p>Signed in as <strong>{email}</strong>.</p>
              <Btn onClick={go}>Accept invitation</Btn>
            </>
          )}
          {err && <p role="alert" className="text-destructive">{err}</p>}
        </div>
      </div>
    </Shell>
  );
}
