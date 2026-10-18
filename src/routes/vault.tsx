import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Shell, PageHeader, Tag, Btn } from "@/components/shell";
import { actions, useDemo } from "@/lib/store";
import { services, agents } from "@/lib/demo-data";

export const Route = createFileRoute("/vault")({
  head: () => ({ meta: [
    { title: "Digital Vault — Cyber Race" },
    { name: "description", content: "Review, revoke and audit every permission your Cyber Race agents hold." },
    { property: "og:title", content: "Digital Vault — Cyber Race" },
    { property: "og:description", content: "Permissions, revocation and full audit history." },
  ] }),
  component: Vault,
});

const tone = { grant: "cyan", revoke: "warn", action: "muted", approval: "gold", deny: "danger", blocked: "danger" } as const;

function Vault() {
  const s = useDemo();
  const [confirm, setConfirm] = useState(false);
  const name = (id: string, list: { id: string; name: string }[]) => list.find((x) => x.id === id)?.name ?? id;
  return (
    <Shell>
      <PageHeader eyebrow="Digital Vault" title="Your permissions, in plain sight">
        Every access an agent holds, and every action taken, is listed here. Demo data lives only in this browser — no real credentials are ever stored.
      </PageHeader>
      <section className="panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Active permissions ({s.grants.length})</h2>
          {!confirm ? <Btn variant="danger" disabled={!s.grants.length} onClick={() => setConfirm(true)}>Revoke all</Btn> : (
            <div className="flex items-center gap-2" role="alertdialog" aria-label="Confirm revoke all">
              <span className="text-sm">Revoke everything?</span>
              <Btn variant="danger" onClick={() => { actions.revokeAll(); setConfirm(false); toast("All permissions revoked"); }}>Yes, revoke</Btn>
              <Btn variant="ghost" onClick={() => setConfirm(false)}>Cancel</Btn>
            </div>
          )}
        </div>
        {s.grants.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">No agent has access to anything. Grant mock permissions from Services.</p> : (
          <ul className="mt-4 divide-y divide-border">
            {s.grants.map((g) => (
              <li key={g.serviceId + g.agentId + g.scope} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <span><strong>{name(g.agentId, agents)}</strong> → {name(g.serviceId, services)} · <span className="font-mono text-xs">{g.scope}</span> <Tag tone="cyan">mock</Tag></span>
                <Btn variant="danger" className="px-3 py-1 text-xs" onClick={() => actions.revoke(g.serviceId, g.agentId, g.scope)}>Revoke</Btn>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="panel mt-6 p-5">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Audit history</h2>
          <Btn variant="ghost" className="text-xs" onClick={() => { actions.reset(); toast("Demo data reset"); }}>Reset demo</Btn></div>
        <ol className="mt-4 space-y-2">
          {s.audit.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center gap-3 rounded-lg bg-secondary/50 p-3 text-sm">
              <time className="font-mono text-xs text-muted-foreground" dateTime={e.at}>{new Date(e.at).getTime() === 0 ? "setup" : new Date(e.at).toLocaleString()}</time>
              <span className="font-medium">{e.actor}</span><span className="flex-1">{e.event}</span><Tag tone={tone[e.kind]}>{e.kind}</Tag>
            </li>
          ))}
        </ol>
      </section>
    </Shell>
  );
}
