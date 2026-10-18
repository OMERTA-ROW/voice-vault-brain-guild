import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { LayoutGrid, Mic, Bot, ShieldCheck, Inbox, Menu, X } from "lucide-react";
import { useDemo } from "@/lib/store";

const all = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/brain-builder", label: "Brain Builder" },
  { to: "/console", label: "Console" },
  { to: "/agents", label: "Agents" },
  { to: "/services", label: "Services" },
  { to: "/vault", label: "Vault" },
  { to: "/inbox", label: "Approvals" },
  { to: "/previews", label: "WorkLife & CreatorLife" },
  { to: "/roadmap", label: "Architecture" },
] as const;

const mobile = [
  { to: "/dashboard", label: "Home", icon: LayoutGrid },
  { to: "/agents", label: "Agents", icon: Bot },
  { to: "/console", label: "Speak", icon: Mic },
  { to: "/vault", label: "Vault", icon: ShieldCheck },
  { to: "/inbox", label: "Inbox", icon: Inbox },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="Cyber Race home">
      <span aria-hidden className="grid h-8 w-8 place-items-center rounded-full border border-primary/60 glow-gold">
        <span className="h-2.5 w-2.5 rounded-full bg-signal" />
      </span>
      <span className="font-display text-sm font-semibold tracking-[0.18em]">CYBER<span className="text-gold">RACE</span></span>
    </Link>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { approvals } = useDemo();
  const pending = approvals.filter((a) => a.status === "pending").length;
  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">Skip to content</a>
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {all.map((l) => (
              <Link key={l.to} to={l.to} className="rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-primary" }}>
                {l.label}{l.to === "/inbox" && pending > 0 && <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">{pending}</span>}
              </Link>
            ))}
          </nav>
          <button className="rounded-md p-2 lg:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <nav aria-label="Mobile full" className="border-t border-border px-4 py-3 lg:hidden">
            {all.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block rounded-md px-3 py-2.5 text-muted-foreground" activeProps={{ className: "text-primary bg-secondary" }}>{l.label}</Link>
            ))}
          </nav>
        )}
      </header>
      <div className="border-b border-border bg-secondary/60 py-1.5 text-center font-mono text-[11px] tracking-wider text-muted-foreground">
        DEMO MVP · all integrations are simulated · nothing is sent, charged, or connected
      </div>
      <main id="main" className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur-xl lg:hidden">
        <ul className="mx-auto flex max-w-md justify-around py-2">
          {mobile.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link to={to} className="relative flex flex-col items-center gap-1 px-3 py-1 text-[11px] text-muted-foreground" activeProps={{ className: "text-primary" }}>
                <Icon className="h-5 w-5" aria-hidden />{label}
                {to === "/inbox" && pending > 0 && <span className="absolute right-1 top-0 h-2 w-2 rounded-full bg-primary" aria-label={`${pending} pending`} />}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-8">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-semibold md:text-4xl">{title}</h1>
      {children && <p className="mt-3 max-w-2xl text-muted-foreground">{children}</p>}
    </div>
  );
}

export function Tag({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "gold" | "cyan" | "warn" | "danger" | "ok" }) {
  const t = { muted: "border-border text-muted-foreground", gold: "border-primary/40 text-primary", cyan: "border-accent/40 text-accent", warn: "border-warning/40 text-warning", danger: "border-destructive/50 text-destructive", ok: "border-success/40 text-success" }[tone];
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${t}`}>{children}</span>;
}

export function Btn({ variant = "gold", className = "", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "gold" | "ghost" | "danger" | "cyan" }) {
  const v = { gold: "bg-primary text-primary-foreground hover:brightness-110 glow-gold", cyan: "bg-accent text-accent-foreground hover:brightness-110", ghost: "border border-border text-foreground hover:bg-secondary", danger: "border border-destructive/50 text-destructive hover:bg-destructive/10" }[variant];
  return <button {...p} className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${v} ${className}`} />;
}
