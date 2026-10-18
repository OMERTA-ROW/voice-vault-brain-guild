import { createFileRoute } from "@tanstack/react-router";
import { Shell, PageHeader, Tag } from "@/components/shell";

export const Route = createFileRoute("/roadmap")({
  head: () => ({ meta: [
    { title: "Architecture & Roadmap — Cyber Race" },
    { name: "description", content: "How Cyber Race is designed, its security principles, and the staged roadmap from demo to real integrations." },
    { property: "og:title", content: "Architecture & Roadmap — Cyber Race" },
    { property: "og:description", content: "Design principles and staged roadmap for Cyber Race." },
  ] }),
  component: Roadmap,
});

const layers = [
  ["Cyber Society", "The wider ecosystem of communities, apps and people."],
  ["Cyber Race", "The connecting foundation: identity, agent registry, interoperability."],
  ["Personal Brain", "Your portable memory, values and preferences — owned by you."],
  ["Digital Vault", "Permission grants, revocation and append-only audit history."],
  ["Agents", "Personality + declared capabilities. Can only act within granted scopes."],
  ["Connectors", "Adapters to outside services. Mocked today; server-side in future."],
];

const principles = [
  "No credentials in client code. Future tokens live in an encrypted server-side vault, never in the browser.",
  "Least privilege: agents declare capabilities; users grant narrow scopes; everything is revocable.",
  "Sensitive actions (purchases, sending, deleting, home security) require strong explicit approval — typed confirmation today; re-authentication and spending limits planned.",
  "Every action writes to an audit trail the user can read.",
  "Honest states: nothing is labeled connected, certified, or live unless it really is.",
];

const stages = [
  { s: "Stage 0 · Now", t: "Demo MVP", d: "Local-only demo: Brain Builder, agents, mock services, vault, approvals, scripted voice/text console.", now: true },
  { s: "Stage 1", t: "Accounts & storage", d: "Sign-in, server-stored brain and audit log with per-user access rules." },
  { s: "Stage 2", t: "Real AI conversations", d: "Server-side AI replies with agent personas, guarded by the same approval rules." },
  { s: "Stage 3", t: "First real connectors", d: "Calendar and email via OAuth, tokens held server-side, read-first scopes." },
  { s: "Stage 4", t: "Commerce & home", d: "Purchases and devices only with re-auth, limits and independent review." },
  { s: "Stage 5", t: "Interoperability", d: "Portable brain export, open agent protocol, Cyber Society federation." },
];

function Roadmap() {
  return (
    <Shell>
      <PageHeader eyebrow="Architecture notes" title="How Cyber Race fits together" />
      <ol className="space-y-2">
        {layers.map(([n, d], i) => (
          <li key={n} className="panel flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:gap-6" style={{ marginInline: `${i * 0.75}rem` }}>
            <span className="w-40 font-display text-primary">{n}</span><span className="text-sm text-muted-foreground">{d}</span>
          </li>
        ))}
      </ol>
      <h2 className="mt-12 text-xl font-semibold">Security & trust principles</h2>
      <ul className="panel mt-4 space-y-3 p-5 text-sm">{principles.map((p) => <li key={p} className="flex gap-2"><span className="text-accent">◆</span>{p}</li>)}</ul>
      <h2 className="mt-12 text-xl font-semibold">Staged roadmap</h2>
      <ol className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stages.map((x) => (
          <li key={x.s} className={`panel p-5 ${x.now ? "border-primary/50 glow-gold" : ""}`}>
            <div className="flex items-center justify-between"><span className="eyebrow">{x.s}</span>{x.now && <Tag tone="gold">current</Tag>}</div>
            <h3 className="mt-2 font-semibold">{x.t}</h3><p className="mt-2 text-sm text-muted-foreground">{x.d}</p>
          </li>
        ))}
      </ol>
    </Shell>
  );
}
