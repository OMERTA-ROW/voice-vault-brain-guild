import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { canAssignRole, canManageMembers, assignableRoles, canAcceptInvite, hashToken, type Role } from "./access";

type Ctx = { supabase: any; userId: string; claims: any };

async function myRole(ctx: Ctx): Promise<Role | null> {
  const { data } = await ctx.supabase.from("user_roles").select("role").eq("user_id", ctx.userId).maybeSingle();
  return (data?.role as Role) ?? null;
}
async function admin() {
  return (await import("@/integrations/supabase/client.server")).supabaseAdmin;
}
async function requireManager(ctx: Ctx): Promise<Role> {
  const r = await myRole(ctx);
  if (!canManageMembers(r)) throw new Error("Forbidden");
  return r!;
}

export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const role = await myRole(context as Ctx);
    const ownerConfigured = !!process.env["OWNER_EMAIL"];
    return { role, ownerConfigured };
  });

/** Trusted bootstrap: only the verified account matching the OWNER_EMAIL secret, only while no owner exists. */
export const claimOwner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ownerEmail = process.env["OWNER_EMAIL"]?.trim().toLowerCase();
    if (!ownerEmail) return { ok: false, error: "Owner email is not configured yet." };
    const sa = await admin();
    const { data: u } = await sa.auth.admin.getUserById(context.userId);
    const email = u.user?.email?.toLowerCase();
    if (!u.user?.email_confirmed_at || email !== ownerEmail) return { ok: false, error: "This account is not the configured, verified owner." };
    const { data: existing } = await sa.from("user_roles").select("user_id").eq("role", "owner").maybeSingle();
    if (existing) return { ok: false, error: "An owner already exists." };
    const { error } = await sa.from("user_roles").upsert({ user_id: context.userId, role: "owner" }, { onConflict: "user_id" });
    if (error) return { ok: false, error: "Could not assign owner." };
    return { ok: true };
  });

export const listAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const me = await requireManager(context as Ctx);
    const sa = await admin();
    const { data: roles } = await sa.from("user_roles").select("user_id, role, created_at").order("created_at");
    const members = await Promise.all((roles ?? []).map(async (r) => {
      const { data } = await sa.auth.admin.getUserById(r.user_id);
      return { userId: r.user_id, role: r.role as Role, email: data.user?.email ?? "(unknown)", isSelf: r.user_id === context.userId };
    }));
    const { data: invites } = await sa.from("invitations").select("id, email, role, expires_at, used_at, revoked_at, created_at").order("created_at", { ascending: false });
    return { me, assignable: assignableRoles(me), members, invites: invites ?? [] };
  });

export const createInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ email: z.string().trim().email().max(255), role: z.enum(["admin", "member", "tester"]), days: z.number().int().min(1).max(30) }).parse(d))
  .handler(async ({ data, context }) => {
    const me = await requireManager(context as Ctx);
    if (!assignableRoles(me).includes(data.role)) throw new Error("Forbidden");
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    const token = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    const sa = await admin();
    const { error } = await sa.from("invitations").insert({
      email: data.email.toLowerCase(), role: data.role, token_hash: await hashToken(token),
      expires_at: new Date(Date.now() + data.days * 86400000).toISOString(), created_by: context.userId,
    });
    if (error) throw new Error("Could not create invitation");
    return { token };
  });

export const revokeInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireManager(context as Ctx);
    const sa = await admin();
    await sa.from("invitations").update({ revoked_at: new Date().toISOString() }).eq("id", data.id).is("used_at", null).is("revoked_at", null);
    return { ok: true };
  });

export const setMemberRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid(), role: z.enum(["admin", "member", "tester"]) }).parse(d))
  .handler(async ({ data, context }) => {
    const me = await requireManager(context as Ctx);
    const sa = await admin();
    const { data: t } = await sa.from("user_roles").select("role").eq("user_id", data.userId).maybeSingle();
    if (!t || !canAssignRole(me, t.role as Role, data.role, data.userId === context.userId)) throw new Error("Forbidden");
    await sa.from("user_roles").update({ role: data.role }).eq("user_id", data.userId);
    return { ok: true };
  });

export const removeMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const me = await requireManager(context as Ctx);
    const sa = await admin();
    const { data: t } = await sa.from("user_roles").select("role").eq("user_id", data.userId).maybeSingle();
    // Same rule as role changes: can't touch self, owner, or equal/higher roles.
    if (!t || !canAssignRole(me, t.role as Role, "tester", data.userId === context.userId)) throw new Error("Forbidden");
    await sa.from("user_roles").delete().eq("user_id", data.userId);
    return { ok: true };
  });

export const acceptInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ token: z.string().regex(/^[0-9a-f]{64}$/) }).parse(d))
  .handler(async ({ data, context }) => {
    const sa = await admin();
    const { data: inv } = await sa.from("invitations").select("*").eq("token_hash", await hashToken(data.token)).maybeSingle();
    if (!inv) return { ok: false, error: "This invitation link is not valid." };
    const { data: u } = await sa.auth.admin.getUserById(context.userId);
    const user = u.user ? { email: u.user.email ?? "", emailVerified: !!u.user.email_confirmed_at } : null;
    const invite = { orgId: "app", role: inv.role as Role, expiresAt: inv.expires_at, usedAt: inv.used_at, revokedAt: inv.revoked_at };
    if (!canAcceptInvite(invite, inv.email, user)) return { ok: false, error: "This invitation is expired, already used, revoked, or meant for a different verified email." };
    const { data: existing } = await sa.from("user_roles").select("role").eq("user_id", context.userId).maybeSingle();
    if (existing) return { ok: false, error: "This account already has access." };
    // Atomic single-use claim.
    const { data: claimed } = await sa.from("invitations").update({ used_at: new Date().toISOString(), used_by: context.userId })
      .eq("id", inv.id).is("used_at", null).is("revoked_at", null).select("id");
    if (!claimed?.length) return { ok: false, error: "This invitation was already used." };
    await sa.from("user_roles").insert({ user_id: context.userId, role: inv.role });
    return { ok: true };
  });
