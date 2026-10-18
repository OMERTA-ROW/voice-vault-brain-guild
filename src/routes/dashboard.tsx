import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, PageHeader, Tag } from "@/components/shell";
import { useDemo } from "@/lib/store";
import { agents } from "@/lib/demo-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [
    { title: "Dashboard — Cyber Race" },
    { name: "description", content: "Your Cyber Race member dashboard: brain status, agents, approvals and vault activity." },
    { property: "og:title", content: "Member Dashboard — Cyber Race" },
    { property: "og:description", content: "Brain status, agents, approvals and vault activity at a glance." },
  ] }),
  component: Dashboard,
});

function Dashboard() {
  const s = useDemo();
  const pending = s.approvals.filter((a) => a.status === "pending");
  return (
    <Shell>
      <PageHeader eyebrow="Member dashboard" title={s.brain.name ? `Welcome back, ${s.brain.name}` : "Welcome, traveler"}>
        Here's your corner of Cyber Race. Everything below is demo data stored only in this browser.
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Your brain" to="/brain-builder" cta={s.brain.done ? "Edit brain" : "Start Brain Builder"}>
          {s.brain.done ? <p>Voice: {s.brain.voice} · Sharing: {s.brain.sharing}<br />{s.memories.length} memories saved</p> : <p>Not set up yet. Takes about a minute.</p>}
        </Card>
        <Card title="Approvals" to="/inbox" cta="Open inbox">
          <p><span className="text-3xl font-display text-primary">{pending.length}</span> waiting for you</p>
        </Card>
        <Card title="Vault" to="/vault" cta="Review permissions">
          <p>{s.grants.length} active mock permissions · {s.audit.length} audit events</p>
        </Card>
      </div>
      <h2 className="mt-10 text-xl font-semibold">Your agents</h2>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
        {agents.map((a) => (
          <Link key={a.id} to="/agents" className="panel min-w-52 p-4 hover:border-primary/40">
            <p className="font-display">{a.name}</p><p className="text-xs text-muted-foreground">{a.role}</p>
            <p className="mt-3 text-sm italic">“{a.greeting}”</p>
          </Link>
        ))}
      </div>
      <h2 className="mt-10 text-xl font-semibold">Recent activity</h2>
      <ul className="panel mt-4 divide-y divide-border">
        {s.audit.slice(0, 5).map((e) => (
          <li key={e.id} className="flex items-center justify-between gap-3 p-3 text-sm"><span>{e.event}</span><Tag>{e.kind}</Tag></li>
        ))}
      </ul>
    </Shell>
  );
}

function Card({ title, to, cta, children }: { title: string; to: "/brain-builder" | "/inbox" | "/vault"; cta: string; children: React.ReactNode }) {
  return (
    <div className="panel flex flex-col p-5">
      <p className="eyebrow">{title}</p>
      <div className="mt-3 flex-1 text-sm text-muted-foreground">{children}</div>
      <Link to={to} className="mt-4 text-sm text-primary hover:underline">{cta} →</Link>
    </div>
  );
}
