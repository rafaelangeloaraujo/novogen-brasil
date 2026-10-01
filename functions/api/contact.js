const departments = { comercial: "Comercial", tecnico: "Técnico", planejamento: "Planejamento", ouvidoria: "Ouvidoria" };
const json = (status, body) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("Origin");
  if (!origin || origin !== new URL(request.url).origin) return json(403, { error: "Origem inválida." });
  if (!request.headers.get("Content-Type")?.includes("application/json")) return json(415, { error: "Formato inválido." });
  const raw = await request.text();
  if (raw.length > 12000) return json(413, { error: "Mensagem muito longa." });
  let data;
  try { data = JSON.parse(raw); } catch { return json(400, { error: "Dados inválidos." }); }
  if (!data || typeof data !== "object") return json(400, { error: "Dados inválidos." });
  if (data.website) return json(200, { ok: true });
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const message = typeof data.message === "string" ? data.message.trim() : "";
  const department = Object.hasOwn(departments, data.department) ? departments[data.department] : null;
  if (!name || name.length > 120 || /[\r\n]/.test(name) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !message || message.length > 5000 || !department) {
    return json(400, { error: "Preencha os campos corretamente." });
  }
  if (!env.RESEND_API_KEY || !env.CONTACT_FROM_EMAIL) return json(503, { error: "Envio indisponível." });
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.CONTACT_FROM_EMAIL,
        to: ["garaujo@novogen.com.br"],
        reply_to: email,
        subject: `Contato pelo site Novogen Brasil — ${department}`,
        text: `Nome: ${name}\nE-mail: ${email}\nÁrea: ${department}\n\nMensagem:\n${message}`
      }),
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) return json(502, { error: "Não foi possível enviar." });
    return json(200, { ok: true });
  } catch {
    return json(502, { error: "Não foi possível enviar." });
  }
}

export const onRequestGet = () => json(405, { error: "Método não permitido." });
