import { redirect, requireAdmin } from "./_shared.js";

const PUBLIC_ADMIN_ROUTES = new Set([
  "/admin/login",
  "/admin/hash-password"
]);

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (PUBLIC_ADMIN_ROUTES.has(url.pathname)) {
    return context.next();
  }

  const session = await requireAdmin(context);
  if (!session) {
    return redirect("/admin/login");
  }

  return context.next();
}
