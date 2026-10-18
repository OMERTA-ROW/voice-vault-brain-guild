import { createFileRoute } from "@tanstack/react-router";
import { Shell, PageHeader } from "@/components/shell";
import { ApprovalCard } from "@/components/approval-card";
import { useDemo } from "@/lib/store";

export const Route = createFileRoute("/inbox")({
  head: () => ({ meta: [
    { title: "Approval Inbox — Cyber Race" },
    { name: "description", content: "Review and explicitly approve or deny sensitive actions your agents have drafted." },
    { property: "og:title", content: "Approval Inbox — Cyber Race" },
    { property: "og:description", content: "Sensitive actions wait here for your explicit approval." },
  ] }),
  component: Inbox,
});

function Inbox() {
  const { approvals } = useDemo();
  const pending = approvals.filter((a) => a.status === "pending");
  const done = approvals.filter((a) => a.status !== "pending");
  return (
    <Shell>
      <PageHeader eyebrow="Approval inbox" title="Waiting on you">Purchases, messages and deletions never happen on their own. Type the confirmation phrase to approve.</PageHeader>
      {pending.length === 0 && <p className="panel p-5 text-sm text-muted-foreground">All clear. Try “buy concert tickets” in the console to see a request arrive.</p>}
      <div className="grid gap-4 md:grid-cols-2">{pending.map((a) => <ApprovalCard key={a.id} a={a} />)}</div>
      {done.length > 0 && (<><h2 className="mt-10 text-xl font-semibold">Decided</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">{done.map((a) => <ApprovalCard key={a.id} a={a} />)}</div></>)}
    </Shell>
  );
}
