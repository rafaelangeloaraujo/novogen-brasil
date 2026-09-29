import {
  clearSessionCookies,
  isSameOriginRequest,
  logAction,
  redirect,
  requireAdmin,
  validCsrfToken
} from "./_shared.js";

export async function onRequestPost(context) {
  if (!isSameOriginRequest(context.request)) {
    return new Response(null, { status: 403 });
  }

  const session = await requireAdmin(context);
  if (!session?.username) {
    return redirect("/admin/login", {
      "Set-Cookie": clearSessionCookies()
    });
  }

  const form = await context.request.formData();
  if (!validCsrfToken(context.request, form.get("csrf_token"), session.csrf)) {
    return new Response(null, { status: 403 });
  }

  await logAction(context.env, context.request, session.username, "logout");

  return redirect("/admin/login", {
    "Set-Cookie": clearSessionCookies()
  });
}

export async function onRequestGet() {
  return new Response(null, {
    status: 405,
    headers: { Allow: "POST" }
  });
}
