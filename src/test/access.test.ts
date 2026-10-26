import { describe, it, expect } from "vitest";
import { canAssignRole, assignableRoles, canManageMembers, inviteStatus, canAcceptInvite, canReadOrgRow, hashToken, type Invitation } from "@/lib/access";

const now = new Date("2026-10-26T12:00:00Z");
const inv = (p: Partial<Invitation> = {}): Invitation => ({ orgId: "o1", role: "tester", expiresAt: "2026-11-01T00:00:00Z", usedAt: null, revokedAt: null, ...p });
const verified = { email: "jax@example.com", emailVerified: true };

describe("roles", () => {
  it("signed-out users cannot manage or assign", () => {
    expect(canManageMembers(null)).toBe(false);
    expect(canAssignRole(null, "tester", "member", false)).toBe(false);
  });
  it("owner role is never assignable", () => {
    expect(assignableRoles("owner")).not.toContain("owner");
    expect(canAssignRole("owner", "admin", "owner", false)).toBe(false);
  });
  it("admin cannot escalate anyone to admin", () => expect(canAssignRole("admin", "member", "admin", false)).toBe(false));
  it("admin cannot change another admin or the owner", () => {
    expect(canAssignRole("admin", "admin", "tester", false)).toBe(false);
    expect(canAssignRole("admin", "owner", "tester", false)).toBe(false);
  });
  it("nobody changes their own role", () => expect(canAssignRole("owner", "owner", "admin", true)).toBe(false));
  it("testers and members cannot manage", () => {
    expect(canManageMembers("tester")).toBe(false);
    expect(canManageMembers("member")).toBe(false);
  });
});

describe("invitations", () => {
  it("expired, used and revoked invites are rejected", () => {
    expect(inviteStatus(inv({ expiresAt: "2026-10-01T00:00:00Z" }), now)).toBe("expired");
    expect(inviteStatus(inv({ usedAt: "2026-10-20T00:00:00Z" }), now)).toBe("used");
    expect(inviteStatus(inv({ revokedAt: "2026-10-20T00:00:00Z" }), now)).toBe("revoked");
  });
  it("requires a signed-in verified account with matching email", () => {
    expect(canAcceptInvite(inv(), "jax@example.com", null, now)).toBe(false);
    expect(canAcceptInvite(inv(), "jax@example.com", { ...verified, emailVerified: false }, now)).toBe(false);
    expect(canAcceptInvite(inv(), "other@example.com", verified, now)).toBe(false);
    expect(canAcceptInvite(inv(), "JAX@example.com", verified, now)).toBe(true);
  });
  it("an owner invitation can never be accepted", () => expect(canAcceptInvite(inv({ role: "owner" }), "jax@example.com", verified, now)).toBe(false));
  it("tokens are stored only as hashes", async () => {
    const h = await hashToken("secret-token");
    expect(h).toHaveLength(64);
    expect(h).not.toContain("secret-token");
  });
});

describe("isolation", () => {
  it("cross-org rows are not readable", () => {
    expect(canReadOrgRow(["o1"], "o2")).toBe(false);
    expect(canReadOrgRow(["o1"], "o1")).toBe(true);
  });
});
