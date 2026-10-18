import { useState } from "react";
import { toast } from "sonner";
import { Btn, Tag } from "@/components/shell";
import { actions, type Approval } from "@/lib/store";

/** Strong explicit approval: user must type the exact phrase before Approve enables. */
export function ApprovalCard({ a }: { a: Approval }) {
  const [typed, setTyped] = useState("");
  const ok = typed.trim() === a.phrase;
  const id = `confirm-${a.id}`;
  return (
    <article className="panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-display">{a.agent} requests</p>
        <Tag tone={a.status === "pending" ? "gold" : a.status === "approved" ? "ok" : "danger"}>{a.status}</Tag>
      </div>
      <p className="mt-2 text-sm">{a.summary}</p>
      {a.status === "pending" ? (
        <div className="mt-4">
          <label htmlFor={id} className="text-xs text-muted-foreground">Type <span className="font-mono text-primary">{a.phrase}</span> to approve</label>
          <input id={id} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm" />
          <div className="mt-3 flex gap-2">
            <Btn disabled={!ok} onClick={() => { actions.decide(a.id, true); toast.success("Approved — simulated only, nothing was executed"); }}>Approve</Btn>
            <Btn variant="ghost" onClick={() => { actions.decide(a.id, false); toast("Denied"); }}>Deny</Btn>
          </div>
        </div>
      ) : a.status === "approved" && <p className="mt-3 text-xs text-muted-foreground">Simulated: no real service was contacted.</p>}
    </article>
  );
}
