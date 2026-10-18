import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, Clapperboard } from "lucide-react";
import { Shell, PageHeader, Tag } from "@/components/shell";

export const Route = createFileRoute("/previews")({
  head: () => ({ meta: [
    { title: "WorkLife & CreatorLife Previews — Cyber Race" },
    { name: "description", content: "Early previews of Cyber Race WorkLife and CreatorLife experiences — coming soon." },
    { property: "og:title", content: "WorkLife & CreatorLife — Cyber Race" },
    { property: "og:description", content: "A look at what's coming for work and creators." },
  ] }),
  component: Previews,
});

const tracks = [
  { icon: Briefcase, name: "WorkLife", tone: "gold" as const, items: ["Morning brief from your calendar & inbox", "Meeting notes into your brain", "Focus guardian for deep-work blocks", "Draft replies you approve before sending"] },
  { icon: Clapperboard, name: "CreatorLife", tone: "cyan" as const, items: ["Idea vault that learns your style", "Script & caption co-writing with Muse", "Cross-platform post scheduler (approval-gated)", "Audience insights in plain words"] },
];

function Previews() {
  return (
    <Shell>
      <PageHeader eyebrow="Feature previews" title="WorkLife & CreatorLife">These are previews of planned experiences. None of them are live yet.</PageHeader>
      <div className="grid gap-6 md:grid-cols-2">
        {tracks.map(({ icon: Icon, name, tone, items }) => (
          <section key={name} className={`panel p-6 ${tone === "gold" ? "glow-gold" : "glow-cyan"}`}>
            <div className="flex items-center justify-between"><Icon className={tone === "gold" ? "text-primary" : "text-accent"} aria-hidden /><Tag>Preview · coming soon</Tag></div>
            <h2 className="mt-4 text-2xl font-semibold">{name}</h2>
            <ul className="mt-4 space-y-3 text-sm">{items.map((i) => <li key={i} className="flex gap-2"><span className={tone === "gold" ? "text-primary" : "text-accent"}>◆</span>{i}</li>)}</ul>
          </section>
        ))}
      </div>
    </Shell>
  );
}
