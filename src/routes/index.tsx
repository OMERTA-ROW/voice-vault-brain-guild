import { createFileRoute, Link } from "@tanstack/react-router";
import { Mic, ShieldCheck, Network, Sparkles } from "lucide-react";
import hero from "@/assets/hero-cosmos.jpg";
import { Logo } from "@/components/shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cyber Race — Your portable, voice-first AI brain" },
      { name: "description", content: "Join Cyber Race: build a permission-controlled personal AI brain that connects with the wider Cyber Society. Free-friendly and inclusive." },
      { property: "og:title", content: "Cyber Race — Your portable AI brain" },
      { property: "og:description", content: "A voice-first AI interoperability community. Your brain, your permissions." },
    ],
  }),
  component: Landing,
});

const pillars = [
  { icon: Mic, title: "Voice-first", text: "Speak naturally. Your agents answer like people who know you." },
  { icon: ShieldCheck, title: "You hold the keys", text: "Every permission is visible, revocable, and logged in your Digital Vault." },
  { icon: Network, title: "Interoperable", text: "One portable brain that can travel across tools and communities." },
  { icon: Sparkles, title: "Free-friendly", text: "Built so anyone can take part — no gatekeeping to get started." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <section className="relative isolate flex min-h-[92vh] flex-col overflow-hidden">
        <img src={hero} alt="" width={1920} height={1088} className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/30 via-background/40 to-background" />
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5">
          <Logo />
          <Link to="/dashboard" className="rounded-lg border border-border bg-background/40 px-4 py-2 text-sm backdrop-blur hover:bg-secondary">Enter demo</Link>
        </header>
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-4 pb-16">
          <p className="eyebrow">Cyber Race · foundation of the Cyber Society</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-[1.05] md:text-7xl">
            Your mind, <span className="text-gold">connected</span>.<br />On your terms.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Build a portable personal AI brain, meet agents with real warmth, and decide exactly what they can touch — by voice or by text.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/brain-builder" className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground glow-gold hover:brightness-110">Build your brain</Link>
            <Link to="/console" className="rounded-lg border border-accent/50 px-6 py-3 font-medium text-accent hover:bg-accent/10">Try the voice console</Link>
          </div>
          <p className="mt-6 font-mono text-xs text-muted-foreground">Demo MVP — integrations are simulated. No external services are connected.</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-20 sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map(({ icon: Icon, title, text }) => (
          <div key={title} className="panel p-6">
            <Icon className="h-6 w-6 text-accent" aria-hidden />
            <h2 className="mt-4 text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
      </section>
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Cyber Race Family · demo build · <Link to="/roadmap" className="underline hover:text-foreground">Architecture & roadmap</Link>
      </footer>
    </div>
  );
}
