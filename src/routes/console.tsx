import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Send } from "lucide-react";
import { Shell, PageHeader, Tag, Btn } from "@/components/shell";
import { interpretCommand, type CommandResult } from "@/lib/commands";
import { actions } from "@/lib/store";

export const Route = createFileRoute("/console")({
  head: () => ({ meta: [
    { title: "Voice Command Console — Cyber Race" },
    { name: "description", content: "Speak or type to your Cyber Race agents. Safe simulated actions with explicit confirmation for anything sensitive." },
    { property: "og:title", content: "Voice Console — Cyber Race" },
    { property: "og:description", content: "Voice-first demo console with safe, simulated actions." },
  ] }),
  component: Console,
});

interface Msg { from: "you" | "agent"; text: string; result?: CommandResult; approvalId?: string }
const examples = ["Remind me to call Mum on Sunday", "Plan my Tuesday", "Give me video ideas", "Buy two concert tickets", "Send an email to Sam", "Unlock the front door"];

/* eslint-disable @typescript-eslint/no-explicit-any */
function Console() {
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "agent", text: "Hi, I'm Nova. Say or type anything — I'll keep it safe and simulated." }]);
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceOk, setVoiceOk] = useState(false);
  const recRef = useRef<any>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setVoiceOk(!!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [msgs]);

  function run(input: string) {
    if (!input.trim()) return;
    const r = interpretCommand(input);
    let approvalId: string | undefined;
    if (r.risk === "sensitive") approvalId = actions.requestApproval(r.agent, input.trim(), r.confirmPhrase!);
    else if (r.risk === "blocked") actions.record(r.agent, `Blocked request: ${r.intent}`, "blocked");
    else if (r.intent === "memory") actions.remember(input.trim());
    else actions.record(r.agent, `Simulated ${r.intent}`, "action");
    setMsgs((m) => [...m, { from: "you", text: input }, { from: "agent", text: r.reply, result: r, approvalId }]);
    setText("");
    if ("speechSynthesis" in window) { const u = new SpeechSynthesisUtterance(r.reply); u.rate = 1.02; speechSynthesis.cancel(); speechSynthesis.speak(u); }
  }

  function toggleMic() {
    if (listening) { recRef.current?.stop(); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR(); rec.lang = "en-US"; rec.interimResults = false;
    rec.onresult = (e: any) => run(e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec; rec.start(); setListening(true);
  }

  return (
    <Shell>
      <PageHeader eyebrow="Command console" title="Talk to your brain">
        Voice uses your browser's built-in speech features when available. No real AI service is connected — replies come from a safe demo script.
      </PageHeader>
      <div className="panel flex h-[60vh] flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto p-4" role="log" aria-live="polite">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.from === "you" ? "justify-end" : ""}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${m.from === "you" ? "bg-primary/15 text-foreground" : "bg-secondary"}`}>
                {m.result && <div className="mb-1 flex items-center gap-2"><span className="font-display text-xs">{m.result.agent}</span>
                  <Tag tone={m.result.risk === "safe" ? "ok" : m.result.risk === "sensitive" ? "warn" : "danger"}>{m.result.risk}</Tag></div>}
                {m.text}
                {m.approvalId && <p className="mt-2"><Link to="/inbox" className="text-primary underline">Review in approval inbox →</Link></p>}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div className="flex flex-wrap gap-2 border-t border-border px-4 pt-3">
          {examples.map((e) => <button key={e} onClick={() => run(e)} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground">{e}</button>)}
        </div>
        <form className="flex gap-2 p-4" onSubmit={(e) => { e.preventDefault(); run(text); }}>
          <button type="button" onClick={toggleMic} disabled={!voiceOk} aria-label={listening ? "Stop listening" : "Start voice input"} aria-pressed={listening}
            title={voiceOk ? undefined : "Voice input isn't supported in this browser"}
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground disabled:opacity-40 ${listening ? "pulse-ring" : ""}`}>
            {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
          <label htmlFor="cmd" className="sr-only">Command</label>
          <input id="cmd" value={text} onChange={(e) => setText(e.target.value)} placeholder={listening ? "Listening…" : "Type a command"} className="flex-1 rounded-lg border border-input bg-background px-4" autoComplete="off" />
          <Btn type="submit" aria-label="Send"><Send className="h-4 w-4" /></Btn>
        </form>
      </div>
    </Shell>
  );
}
