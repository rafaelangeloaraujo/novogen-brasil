import {
  clearSessionCookies,
  cookie,
  csrfFromRequest,
  ensureDatabase,
  htmlResponse,
  isSameOriginRequest,
  logAction,
  MAX_LOGIN_ATTEMPTS,
  LOGIN_LOCK_SECONDS,
  redirect,
  randomToken,
  sessionCookies,
  sessionSecret,
  signSession,
  validCsrfToken,
  verifyPassword
} from "./_shared.js";

function loginPage(csrfToken, error = "") {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Acesso administrativo | Novogen Brasil</title>
    <meta name="robots" content="noindex, nofollow">
    <link rel="stylesheet" href="/admin.css">
  </head>
  <body>
    <section class="login-screen">
      <form class="login-card" method="post" action="/admin/login">
        <input type="hidden" name="csrf_token" value="${csrfToken}">
        <img src="/assets/novogen-logo.png" alt="Novogen">
        <span>Painel interno</span>
        <h1>Acesso administrativo</h1>
        <p>Entre para editar textos, imagens e botões do site.</p>
        <label>
          Usuário
          <input type="text" name="username" autocomplete="username" required autofocus>
        </label>
        <label>
          Senha
          <input type="password" name="password" autocomplete="current-password" required>
        </label>
        <button class="primary-button" type="submit">Entrar</button>
        <small>${error}</small>
      </form>
    </section>
  </body>
</html>`;
}

export async function onRequestGet() {
  const csrfToken = randomToken();
  return htmlResponse(loginPage(csrfToken), {
    headers: {
      "Set-Cookie": cookie("novogen_csrf", csrfToken, { maxAge: 60 * 15 })
    }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!isSameOriginRequest(request)) {
    return htmlResponse(loginPage("", "Origem da solicitação inválida."), { status: 403 });
  }

  await ensureDatabase(env);

  const form = await request.formData();
  const submittedCsrf = String(form.get("csrf_token") || "");
  if (!validCsrfToken(request, submittedCsrf)) {
    return htmlResponse(loginPage("", "Sessão do formulário expirada. Recarregue a página."), { status: 403 });
  }

  const username = String(form.get("username") || "").trim();
  const password = String(form.get("password") || "");

  const admin = await env.DB.prepare("SELECT * FROM admins WHERE username = ? AND is_active = 1 LIMIT 1")
    .bind(username)
    .first();

  if (!admin) {
    await logAction(env, request, username, "login_failed_unknown_user");
    return htmlResponse(loginPage(csrfFromRequest(request), "Usuário ou senha inválidos."), { status: 401 });
  }

  if (admin.locked_until && new Date(admin.locked_until).getTime() > Date.now()) {
    await logAction(env, request, username, "login_blocked_locked");
    return htmlResponse(loginPage(csrfFromRequest(request), "Muitas tentativas. Tente novamente em alguns minutos."), { status: 429 });
  }

  const valid = await verifyPassword(password, admin.password_hash);
  if (!valid) {
    const attempts = Number(admin.failed_attempts || 0) + 1;
    const lockedUntil = attempts >= MAX_LOGIN_ATTEMPTS
      ? new Date(Date.now() + LOGIN_LOCK_SECONDS * 1000).toISOString()
      : null;

    await env.DB.prepare(`UPDATE admins
      SET failed_attempts = ?, locked_until = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`)
      .bind(attempts, lockedUntil, admin.id)
      .run();
    await logAction(env, request, username, "login_failed", { attempts, locked: Boolean(lockedUntil) });

    return htmlResponse(loginPage(csrfFromRequest(request), "Usuário ou senha inválidos."), { status: 401 });
  }

  await env.DB.prepare(`UPDATE admins
    SET failed_attempts = 0, locked_until = NULL, last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`)
    .bind(admin.id)
    .run();

  const csrf = randomToken();
  const token = await signSession({
    username: admin.username,
    csrf,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8
  }, sessionSecret(env));

  await logAction(env, request, admin.username, "login_success");

  return redirect("/admin/index.html", {
    "Set-Cookie": sessionCookies(token, csrf)
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 405,
    headers: { Allow: "GET, POST" }
  });
}
