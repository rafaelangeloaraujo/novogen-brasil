import { ensureDatabase, jsonResponse, normalizeCmsContent } from "../admin/_shared.js";

export async function onRequestGet({ env }) {
  await ensureDatabase(env);
  const row = await env.DB.prepare("SELECT content_json FROM cms_content WHERE id = 1 LIMIT 1").first();
  const content = normalizeCmsContent(JSON.parse(row?.content_json || "{}"));

  return jsonResponse(content, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
