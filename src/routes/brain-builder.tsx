import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Shell, PageHeader, Btn } from "@/components/shell";
import { actions, useDemo, type Brain } from "@/lib/store";

export const Route = createFileRoute("/brain-builder")({
  head: () => ({ meta: [
    { title: "Brain Builder — Cyber Race" },
    { name: "description", content: "Guided onboarding to create your portable, permission-controlled personal AI brain." },
    { property: "og:title", content: "Brain Builder — Cyber Race" },
    { property: "og:description", content: "Create your portable personal AI brain in four gentle steps." },
  ] }),
  component: Builder,
});

const valueOpts = ["Family", "Creativity", "Focus", "Wellbeing", "Learning", "Community", "Privacy", "Adventure"];
const voices = [{ id: "warm", label: "Warm & friendly" }, { id: "calm", label: "Calm & steady" }, { id: "playful", label: "Playful & bright" }, { id: "direct", label: "Clear & direct" }];
const sharing = [
  { id: "private", label: "Private", text: "Only you. Nothing leaves your brain." },
  { id: "trusted", label: "Trusted circle", text: "Share chosen memories with people you invite." },
  { id: "community", label: "Community", text: "Opt in to anonymous patterns that help Cyber Society." },
] as const;
const steps = ["Name", "Values", "Voice", "Sharing"];

function Builder() {
  const s = useDemo();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [b, setB] = useState<Brain>(s.brain);
  useEffect(() => setB(s.brain), [s.brain]);
  const canNext = step === 0 ? b.name.trim().length > 0 : step === 1 ? b.values.length > 0 : true;

  return (
    <Shell>
      <PageHeader eyebrow="Brain Builder" title="Let's shape your digital brain">Take your time — you can change any of this later.</PageHeader>
      <ol className="mb-6 flex gap-2" aria-label="Progress">
        {steps.map((l, i) => (
          <li key={l} className={`flex-1 rounded-full py-1 text-center font-mono text-[11px] ${i <= step ? "bg-signal text-primary-foreground" : "bg-secondary text-muted-foreground"}`} aria-current={i === step ? "step" : undefined}>{i + 1}. {l}</li>
        ))}
      </ol>
      <section className="panel max-w-2xl p-6">
        {step === 0 && (
          <label className="block">
            <span className="text-lg font-display">What should your agents call you?</span>
            <input autoFocus value={b.name} onChange={(e) => setB({ ...b, name: e.target.value })} maxLength={40} className="mt-4 w-full rounded-lg border border-input bg-background px-4 py-3" placeholder="e.g. Ari" />
          </label>
        )}
        {step === 1 && (
          <fieldset>
            <legend className="text-lg font-display">What matters most to you?</legend>
            <div className="mt-4 flex flex-wrap gap-2">
              {valueOpts.map((v) => { const on = b.values.includes(v); return (
                <button key={v} type="button" aria-pressed={on} onClick={() => setB({ ...b, values: on ? b.values.filter((x) => x !== v) : [...b.values, v] })}
                  className={`rounded-full border px-4 py-2 text-sm ${on ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}>{v}</button>); })}
            </div>
          </fieldset>
        )}
        {step === 2 && (
          <fieldset>
            <legend className="text-lg font-display">How should your brain sound?</legend>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {voices.map((v) => (
                <label key={v.id} className={`cursor-pointer rounded-lg border p-4 ${b.voice === v.id ? "border-accent bg-accent/10" : "border-border"}`}>
                  <input type="radio" name="voice" className="sr-only" checked={b.voice === v.id} onChange={() => setB({ ...b, voice: v.id })} />{v.label}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        {step === 3 && (
          <fieldset>
            <legend className="text-lg font-display">Who can your brain share with?</legend>
            <div className="mt-4 space-y-2">
              {sharing.map((o) => (
                <label key={o.id} className={`block cursor-pointer rounded-lg border p-4 ${b.sharing === o.id ? "border-primary bg-primary/10" : "border-border"}`}>
                  <input type="radio" name="share" className="sr-only" checked={b.sharing === o.id} onChange={() => setB({ ...b, sharing: o.id })} />
                  <span className="font-medium">{o.label}</span><span className="block text-sm text-muted-foreground">{o.text}</span>
                </label>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Demo: your brain is stored only in this browser. Portable export/sync is on the roadmap.</p>
          </fieldset>
        )}
        <div className="mt-8 flex justify-between">
          <Btn variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Btn>
          {step < 3 ? <Btn disabled={!canNext} onClick={() => setStep(step + 1)}>Continue</Btn> : (
            <Btn onClick={() => { actions.saveBrain({ ...b, done: true }); toast.success(`Welcome to Cyber Race, ${b.name}!`); nav({ to: "/dashboard" }); }}>Create my brain</Btn>
          )}
        </div>
      </section>
    </Shell>
  );
}
