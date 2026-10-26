// Access policy for real accounts (owner / admin / member / tester).
// Pure, framework-free rules. The SAME rules must be enforced server-side
// (database policies + server functions) once a backend is enabled — this
// module never grants access on its own and is never trusted from the client.

export type Role = "owner" | "admin" | "member" | "tester";

const rank: Record<Role, number> = { tester: 1, member: 2, admin: 3, owner: 4 };

/** Roles an inviter may hand out. Owner is never assignable — only via trusted bootstrap. */
export function assignableRoles(actor: Role | null): Role[] {
  if (actor === "owner") return ["admin", "member", "tester"];
  if (actor === "admin") return ["member", "tester"];
  return [];
}

/** Can `actor` change `target`'s role to `next`? Blocks escalation and owner tampering. */
export function canAssignRole(actor: Role | null, target: Role | null, next: Role, isSelf: boolean): boolean {
  if (!actor || isSelf) return false;
  if (target === "owner") return false;
  if (target && rank[target] >= rank[actor]) return false;
  return assignableRoles(actor).includes(next);
}

export function canManageMembers(actor: Role | null): boolean {
  return actor === "owner" || actor === "admin";
}

export interface Invitation {
  orgId: string;
  role: Role;
  expiresAt: string;
  usedAt: string | null;
  revokedAt: string | null;
}

export type InviteStatus = "valid" | "used" | "revoked" | "expired";

export function inviteStatus(inv: Invitation, now: Date = new Date()): InviteStatus {
  if (inv.revokedAt) return "revoked";
  if (inv.usedAt) return "used";
  if (new Date(inv.expiresAt).getTime() <= now.getTime()) return "expired";
  return "valid";
}

/** Invitation acceptance: only valid, single-use, never owner. Email must match the signed-in, verified account. */
export function canAcceptInvite(inv: Invitation, invitedEmail: string, user: { email: string; emailVerified: boolean } | null, now = new Date()): boolean {
  if (!user || !user.emailVerified) return false;
  if (inv.role === "owner") return false;
  if (user.email.trim().toLowerCase() !== invitedEmail.trim().toLowerCase()) return false;
  return inviteStatus(inv, now) === "valid";
}

/** Rows are visible only inside the caller's own org. */
export function canReadOrgRow(callerOrgIds: string[], rowOrgId: string): boolean {
  return callerOrgIds.includes(rowOrgId);
}

/** Only a hash of an invitation token is ever stored. */
export async function hashToken(token: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
