import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { listAdmin, createInvite, revokeInvite, setMemberRole, removeMember } from "@/lib/access.functions";
import { inviteStatus, canAssignRole, type Role } from "@/lib/access";
import { Shell, PageHeader, Btn, Tag } from "@/components/shell";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [
    { title: "Members & invitations — Cyber Race" },
    { name: "description", content: "Owner tools to invite and manage private Cyber Race members." },
    { property: "og:title", content: "Members & invitations — Cyber Race" },
    { property: "og:description", content: "Invite and manage private members." },
  ] }),
  component: Admin,
});

const field = "rounded-lg border border-border bg-input/40 px-3 py-2 text-sm";

function Admin() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin"], queryFn: useServerFn(listAdmin), retry: false });
  const create = useServerFn(createInvite);
  const revoke = useServerFn(revokeInvite);
  const setRole = useServerFn(setMemberRole);
  const remove = useServerFn(removeMember);
  const [email, setEmail] = useState("");
  const [role, setR] = useState<"admin" | "member" | "tester">("tester");
  const [days, setDays] = useState(7);
  const [link, setLink] = useState("");
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin"] });
  const run = async (p: Promise<unknown>, ok: string) => { try { await p; toast.success(ok); refresh(); } catch { toast.error("Not allowed"); } };

  if (q.isLoading) return <Shell><p>Loading…</p></Shell>;
  if (q.error || !q.data) return <Shell><PageHeader eyebrow="Members" title="Owners and admins only">Your account doesn't have permission to manage members.</PageHeader></Shell>;
  const d = q.data;

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    try {
      const r = await create({ data: { email, role, days } });
      setLink(`${window.location.origin}/invite/${r.token}`); setEmail(""); refresh();
    } catch { toast.error("Could not create invitation"); }
  }

  return (
    <Shell>
      <PageHeader eyebrow={`Signed in as ${d.me}`} title="Members & invitations">
        Create single-use links bound to one email. Nothing is emailed — copy the link and share it yourself.
      </PageHeader>
      <form onSubmit={invite} className="panel flex flex-wrap items-end gap-3 p-5">
        <label className="text-sm">Email<br /><input className={field} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label className="text-sm">Role<br /><select className={field} value={role} onChange={(e) => setR(e.target.value as typeof role)}>{d.assignable.map((r) => <option key={r}>{r}</option>)}</select></label>
        <label className="text-sm">Expires in (days)<br /><input className={`${field} w-24`} type="number" min={1} max={30} value={days} onChange={(e) => setDays(Number(e.target.value))} /></label>
        <Btn type="submit">Create invitation</Btn>
      </form>
      {link && (
        <div className="panel mt-3 flex flex-wrap items-center gap-2 p-4 text-sm">
          <code className="break-all">{link}</code>
          <Btn variant="ghost" onClick={() => { navigator.clipboard.writeText(link); toast.success("Copied"); }}>Copy</Btn>
          <span className="text-xs text-muted-foreground">Shown once — only a scrambled copy is stored.</span>
        </div>
      )}
      <h2 className="mt-8 text-xl font-semibold">Members ({d.members.length})</h2>
      <ul className="panel mt-3 divide-y divide-border">
        {d.members.map((m) => (
          <li key={m.userId} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
            <span>{m.email} {m.isSelf && <span className="text-muted-foreground">(you)</span>}</span>
            <span className="flex items-center gap-2">
              <Tag tone={m.role === "owner" ? "gold" : "muted"}>{m.role}</Tag>
              {canAssignRole(d.me, m.role, "tester", m.isSelf) && (
                <>
                  <select aria-label={`Role for ${m.email}`} className={field} value={m.role} onChange={(e) => run(setRole({ data: { userId: m.userId, role: e.target.value as "member" } }), "Role updated")}>
                    {d.assignable.map((r: Role) => <option key={r}>{r}</option>)}
                  </select>
                  <Btn variant="danger" onClick={() => confirm(`Remove ${m.email}'s access?`) && run(remove({ data: { userId: m.userId } }), "Removed")}>Remove</Btn>
                </>
              )}
            </span>
          </li>
        ))}
      </ul>
      <h2 className="mt-8 text-xl font-semibold">Invitations ({d.invites.length})</h2>
      <ul className="panel mt-3 divide-y divide-border">
        {d.invites.length === 0 && <li className="p-3 text-sm text-muted-foreground">No invitations yet.</li>}
        {d.invites.map((i) => {
          const st = inviteStatus({ orgId: "app", role: i.role as Role, expiresAt: i.expires_at, usedAt: i.used_at, revokedAt: i.revoked_at });
          return (
            <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
              <span>{i.email} · {i.role} · expires {new Date(i.expires_at).toLocaleDateString()}</span>
              <span className="flex items-center gap-2">
                <Tag tone={st === "valid" ? "ok" : st === "used" ? "cyan" : "warn"}>{st}</Tag>
                {st === "valid" && <Btn variant="danger" onClick={() => run(revoke({ data: { id: i.id } }), "Revoked")}>Revoke</Btn>}
              </span>
            </li>
          );
        })}
      </ul>
    </Shell>
  );
}
