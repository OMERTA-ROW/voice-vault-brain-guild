import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, PageHeader, Tag } from "@/components/shell";
import { agents } from "@/lib/demo-data";

export const Route = createFileRoute("/agents")({
  head: () => ({ meta: [
    { title: "Agents & Capability Registry — Cyber Race" },
    { name: "description", content: "Meet Cyber Race agents, each with a warm personality and a transparent capability registry." },
    { property: "og:title", content: "Agents — Cyber Race" },
    { property: "og:description", content: "Distinct AI agents with clear, auditable capabilities." },
  ] }),
  component: Agents,
});

const riskTone = { low: "ok", medium: "warn", high: "danger" } as const;

function Agents() {
  return (
    <Shell>
      <PageHeader eyebrow="Agents" title="Your crew">Each agent has its own personality and only the capabilities listed. Anything marked “approval” always asks you first.</PageHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((a) => (
          <article key={a.id} className="panel flex flex-col p-6">
            <div className="flex items-center gap-3">
              <span aria-hidden className={`grid h-12 w-12 place-items-center rounded-full font-display text-lg ${a.hue === "gold" ? "bg-primary/15 text-primary glow-gold" : "bg-accent/15 text-accent glow-cyan"}`}>{a.name[0]}</span>
              <div><h2 className="font-display text-lg">{a.name}</h2><p className="text-xs text-muted-foreground">{a.role}</p></div>
            </div>
            <p className="mt-4 text-sm">{a.personality}</p>
            <p className="mt-3 text-sm italic text-muted-foreground">“{a.greeting}”</p>
            <div className="mt-auto pt-4"><Tag tone={riskTone[a.risk]}>{a.risk} risk</Tag></div>
          </article>
        ))}
      </div>
      <h2 className="mt-12 text-xl font-semibold">Capability registry</h2>
      <div className="panel mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">Agent capabilities</caption>
          <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="p-3">Agent</th><th className="p-3">Capability</th><th className="p-3">Gate</th></tr></thead>
          <tbody>
            {agents.flatMap((a) => a.capabilities.map((c) => (
              <tr key={a.id + c} className="border-b border-border last:border-0">
                <td className="p-3">{a.name}</td><td className="p-3 font-mono text-xs">{c}</td>
                <td className="p-3">{c.includes("strong") ? <Tag tone="danger">strong approval</Tag> : c.includes("approval") ? <Tag tone="warn">approval</Tag> : c.includes("future") ? <Tag>not available</Tag> : <Tag tone="ok">auto (simulated)</Tag>}</td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">Want to talk to them? <Link to="/console" className="text-primary hover:underline">Open the console</Link>.</p>
    </Shell>
  );
}
