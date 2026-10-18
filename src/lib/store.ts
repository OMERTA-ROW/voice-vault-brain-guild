import { useSyncExternalStore } from "react";

export interface Grant { serviceId: string; agentId: string; scope: string; grantedAt: string }
export interface AuditEntry { id: string; at: string; actor: string; event: string; kind: "grant" | "revoke" | "action" | "approval" | "deny" | "blocked" }
export interface Approval { id: string; at: string; agent: string; summary: string; phrase: string; status: "pending" | "approved" | "denied" }
export interface Brain { name: string; values: string[]; voice: string; sharing: "private" | "trusted" | "community"; done: boolean }
export interface State { grants: Grant[]; audit: AuditEntry[]; approvals: Approval[]; brain: Brain; memories: string[] }

const KEY = "cyber-race-demo-v1";
const initial: State = {
  grants: [{ serviceId: "cal", agentId: "atlas", scope: "read events", grantedAt: new Date(0).toISOString() }],
  audit: [{ id: "a0", at: new Date(0).toISOString(), actor: "You", event: "Demo vault created", kind: "grant" }],
  approvals: [{ id: "p0", at: new Date(0).toISOString(), agent: "Muse", summary: "Publish draft post “Behind the build” to Social Channels (mock)", phrase: "APPROVE SEND", status: "pending" }],
  brain: { name: "", values: [], voice: "warm", sharing: "private", done: false },
  memories: [],
};

let state: State = initial;
let loaded = false;
const listeners = new Set<() => void>();
const uid = () => Math.random().toString(36).slice(2, 10);

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try { const raw = localStorage.getItem(KEY); if (raw) state = { ...initial, ...JSON.parse(raw) }; } catch { /* ignore */ }
}
function set(fn: (s: State) => State) {
  state = fn(state);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}
function log(s: State, actor: string, event: string, kind: AuditEntry["kind"]): AuditEntry[] {
  return [{ id: uid(), at: new Date().toISOString(), actor, event, kind }, ...s.audit].slice(0, 200);
}

export function useDemo(): State {
  return useSyncExternalStore(
    (l) => { load(); listeners.add(l); queueMicrotask(l); return () => listeners.delete(l); },
    () => state,
    () => initial,
  );
}

export const actions = {
  grant: (serviceId: string, agentId: string, scope: string) => set((s) => ({
    ...s, grants: [...s.grants, { serviceId, agentId, scope, grantedAt: new Date().toISOString() }],
    audit: log(s, "You", `Granted ${agentId} “${scope}” on ${serviceId} (mock)`, "grant"),
  })),
  revoke: (serviceId: string, agentId: string, scope: string) => set((s) => ({
    ...s, grants: s.grants.filter((g) => !(g.serviceId === serviceId && g.agentId === agentId && g.scope === scope)),
    audit: log(s, "You", `Revoked ${agentId} “${scope}” on ${serviceId}`, "revoke"),
  })),
  revokeAll: () => set((s) => ({ ...s, grants: [], audit: log(s, "You", "Revoked all permissions", "revoke") })),
  record: (actor: string, event: string, kind: AuditEntry["kind"]) => set((s) => ({ ...s, audit: log(s, actor, event, kind) })),
  remember: (note: string) => set((s) => ({ ...s, memories: [note, ...s.memories].slice(0, 50), audit: log(s, "Nova", "Saved a note to demo brain", "action") })),
  requestApproval: (agent: string, summary: string, phrase: string) => {
    const id = uid();
    set((s) => ({ ...s, approvals: [{ id, at: new Date().toISOString(), agent, summary, phrase, status: "pending" }, ...s.approvals],
      audit: log(s, agent, `Requested approval: ${summary}`, "approval") }));
    return id;
  },
  decide: (id: string, approved: boolean) => set((s) => {
    const a = s.approvals.find((x) => x.id === id);
    return { ...s, approvals: s.approvals.map((x) => (x.id === id ? { ...x, status: approved ? "approved" : "denied" } : x)),
      audit: log(s, "You", `${approved ? "Approved (simulated — nothing executed)" : "Denied"}: ${a?.summary ?? id}`, approved ? "approval" : "deny") };
  }),
  saveBrain: (brain: Brain) => set((s) => ({ ...s, brain, audit: log(s, "You", `Brain “${brain.name}” configured`, "action") })),
  reset: () => set(() => initial),
};
