import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Shell, PageHeader, Tag, Btn } from "@/components/shell";
import { services, agents } from "@/lib/demo-data";
import { actions, useDemo } from "@/lib/store";

export const Route = createFileRoute("/services")({
  head: () => ({ meta: [
    { title: "Connected Services — Cyber Race" },
    { name: "description", content: "Catalog of services your Cyber Race brain could connect to. All integrations in this demo are mock." },
    { property: "og:title", content: "Connected Services — Cyber Race" },
    { property: "og:description", content: "Mock integrations catalog with permission scopes." },
  ] }),
  component: Services,
});

function Services() {
  const { grants } = useDemo();
  return (
    <Shell>
      <PageHeader eyebrow="Connected services" title="Services catalog">
        Nothing here is really connected. “Mock” services let you practice granting permissions; “Planned” ones aren't built yet.
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-2">
        {services.map((sv) => (
          <article key={sv.id} className="panel p-5">
            <div className="flex items-start justify-between gap-2">
              <div><h2 className="font-display">{sv.name}</h2><p className="text-xs text-muted-foreground">{sv.category}</p></div>
              {sv.status === "mock" ? <Tag tone="cyan">Mock integration</Tag> : <Tag>Planned · not connected</Tag>}
            </div>
            <ul className="mt-4 space-y-2">
              {sv.scopes.map((scope) => {
                const agent = agents.find((a) => a.capabilities.some((c) => c.split(".")[0] === sv.id || c.startsWith(sv.id))) ?? agents[0];
                const on = grants.some((g) => g.serviceId === sv.id && g.scope === scope);
                return (
                  <li key={scope} className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-mono text-xs">{scope}</span>
                    {sv.status === "planned" ? <span className="text-xs text-muted-foreground">Unavailable</span> : on ? (
                      <Btn variant="danger" className="px-3 py-1 text-xs" onClick={() => { actions.revoke(sv.id, agent.id, scope); toast("Permission revoked"); }}>Revoke</Btn>
                    ) : (
                      <Btn variant="ghost" className="px-3 py-1 text-xs" onClick={() => { actions.grant(sv.id, agent.id, scope); toast.success("Mock permission granted"); }}>Grant (mock)</Btn>
                    )}
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>
    </Shell>
  );
}
