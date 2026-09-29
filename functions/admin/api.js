import {
  csrfFromRequest,
  ensureDatabase,
  isSameOriginRequest,
  jsonResponse,
  logAction,
  normalizeCmsContent,
  requireAdmin
} from "./_shared.js";

export async function onRequestGet(context) {
  const { env } = context;
  await ensureDatabase(env);

  const session = await requireAdmin(context);
  if (!session) {
    return jsonResponse({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const row = await env.DB.prepare("SELECT content_json FROM cms_content WHERE id = 1 LIMIT 1").first();
  const content = normalizeCmsContent(JSON.parse(row?.content_json || "{}"));

  return jsonResponse({
    ok: true,
    content,
    csrfToken: session.csrf
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!isSameOriginRequest(request)) {
    return jsonResponse({ ok: false, error: "invalid_origin" }, { status: 403 });
  }

  await ensureDatabase(env);

  const session = await requireAdmin(context);
  if (!session) {
    return jsonResponse({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return jsonResponse({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const csrfCookie = csrfFromRequest(request);
  if (!payload.csrfToken || payload.csrfToken !== session.csrf || csrfCookie !== session.csrf) {
    return jsonResponse({ ok: false, error: "invalid_csrf" }, { status: 403 });
  }

  const content = normalizeCmsContent(payload.content || {});
  const serialized = JSON.stringify(content);

  await env.DB.prepare(`INSERT INTO cms_content (id, content_json, updated_at)
    VALUES (1, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET content_json = excluded.content_json, updated_at = CURRENT_TIMESTAMP`)
    .bind(serialized)
    .run();

  await logAction(env, request, session.username, "cms_content_saved", { groups: Object.keys(content) });

  return jsonResponse({ ok: true, content });
}
