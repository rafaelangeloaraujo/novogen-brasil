import { clearSessionCookies, logAction, redirect, requireAdmin } from "./_shared.js";

export async function onRequest(context) {
  const session = await requireAdmin(context);
  if (session?.username) {
    await logAction(context.env, context.request, session.username, "logout");
  }

  return redirect("/admin/login", {
    "Set-Cookie": clearSessionCookies()
  });
}
