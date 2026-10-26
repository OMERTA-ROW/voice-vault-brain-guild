import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccess, claimOwner } from "@/lib/access.functions";
import { Shell, PageHeader, Btn, Tag } from "@/components/shell";
import { useSignOut } from "@/lib/use-sign-out";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [
    { title: "Account — Cyber Race" },
    { name: "description", content: "Your private Cyber Race account, role and notes." },
    { property: "og:title", content: "Account — Cyber Race" },
    { property: "og:description", content: "Your private account settings." },
  ] }),
  component: Account,
});

function Account() {
  const qc = useQueryClient();
  const access = useQuery({ queryKey: ["access"], queryFn: useServerFn(getMyAccess) });
  const claim = useServerFn(claimOwner);
  const signOut = useSignOut();
  const [email, setEmail] = useState("");
  const [claimMsg, setClaimMsg] = useState("");
  const [notes, setNotes] = useState<{ id: string; body: string }[]>([]);
  const [note, setNote] = useState("");
  const [noteErr, setNoteErr] = useState("");

  async function loadNotes() {
    const { data } = await supabase.from("private_notes").select("id, body").order("created_at", { ascending: false });
    setNotes(data ?? []);
  }
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? "")); loadNotes(); }, []);

  async function addNote(e: React.FormEvent) {
    e.preventDefault(); setNoteErr("");
    const { error } = await supabase.from("private_notes").insert({ body: note.trim() });
    if (error) return setNoteErr("You need an accepted invitation before saving notes.");
    setNote(""); loadNotes();
  }
  async function doClaim() {
    const r = await claim();
    setClaimMsg(r.ok ? "You are now the owner." : r.error ?? "");
    qc.invalidateQueries({ queryKey: ["access"] });
  }

  const role = access.data?.role ?? null;
  return (
    <Shell>
      <PageHeader eyebrow="Account" title="Your account">Real account data — kept separate from the browser-only demo.</PageHeader>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="panel space-y-3 p-5 text-sm">
          <p className="eyebrow">Signed in</p>
          <p>{email}</p>
          <p>Access: {access.isLoading ? "…" : role ? <Tag tone="gold">{role}</Tag> : <Tag tone="warn">no access yet</Tag>}</p>
          {!role && !access.isLoading && <p className="text-muted-foreground">Open the invitation link you were given to get access.</p>}
          {(role === "owner" || role === "admin") && <Link to="/admin" className="block text-primary hover:underline">Members & invitations →</Link>}
          <Link to="/auth" search={{ mode: "forgot" }} className="block text-primary hover:underline">Change password by email</Link>
          <Btn variant="ghost" onClick={signOut}>Sign out</Btn>
        </section>
        {!role && !access.isLoading && (
          <section className="panel space-y-3 p-5 text-sm">
            <p className="eyebrow">Owner setup</p>
            {access.data?.ownerConfigured
              ? <><p>If you are the configured owner and your email is confirmed, claim ownership.</p><Btn onClick={doClaim}>Claim owner</Btn></>
              : <p className="text-muted-foreground">Owner email is not configured yet, so no one can become owner.</p>}
            {claimMsg && <p role="status">{claimMsg}</p>}
          </section>
        )}
        <section className="panel space-y-3 p-5 text-sm md:col-span-2">
          <p className="eyebrow">Private notes (only you can see these)</p>
          <form onSubmit={addNote} className="flex gap-2">
            <input aria-label="New note" className="flex-1 rounded-lg border border-border bg-input/40 px-3 py-2" maxLength={2000} required value={note} onChange={(e) => setNote(e.target.value)} />
            <Btn type="submit">Save</Btn>
          </form>
          {noteErr && <p className="text-destructive">{noteErr}</p>}
          {notes.length === 0 ? <p className="text-muted-foreground">No notes yet.</p> : <ul className="divide-y divide-border">{notes.map((n) => <li key={n.id} className="py-2">{n.body}</li>)}</ul>}
        </section>
      </div>
    </Shell>
  );
}
