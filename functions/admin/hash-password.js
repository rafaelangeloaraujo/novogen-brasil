import { hashPassword, htmlResponse, jsonResponse } from "./_shared.js";

function formPage(result = "") {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Gerar senha | Novogen Brasil</title>
    <meta name="robots" content="noindex, nofollow">
    <link rel="stylesheet" href="/admin.css">
  </head>
  <body>
    <section class="login-screen">
      <form class="login-card" method="post" action="/admin/hash-password">
        <img src="/assets/novogen-logo.png" alt="Novogen">
        <span>Configuração inicial</span>
        <h1>Gerar hash da senha</h1>
        <p>Use esta página uma vez para gerar o valor de ADMIN_PASSWORD_HASH no Cloudflare.</p>
        <label>
          Senha forte
          <input type="password" name="password" autocomplete="new-password" required autofocus>
        </label>
        <button class="primary-button" type="submit">Gerar hash</button>
        ${result ? `<textarea rows="5" readonly>${result}</textarea>` : ""}
      </form>
    </section>
  </body>
</html>`;
}

function canUseHashTool(env) {
  return !env.ADMIN_PASSWORD_HASH || env.ALLOW_PASSWORD_HASH_TOOL === "true";
}

export async function onRequestGet({ env }) {
  if (!canUseHashTool(env)) {
    return new Response("Not found", { status: 404 });
  }

  return htmlResponse(formPage());
}

export async function onRequestPost({ request, env }) {
  if (!canUseHashTool(env)) {
    return new Response("Not found", { status: 404 });
  }

  const form = await request.formData();
  const password = String(form.get("password") || "");
  if (password.length < 12) {
    return htmlResponse(formPage("Use uma senha com pelo menos 12 caracteres."), { status: 422 });
  }

  return htmlResponse(formPage(await hashPassword(password)));
}

export async function onRequestOptions() {
  return jsonResponse({ ok: true });
}
