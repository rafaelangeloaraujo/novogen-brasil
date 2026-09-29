function htmlResponse(html, init = {}) {
  return new Response(html, {
    status: init.status || 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function formPage() {
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
      <section class="login-card" data-hash-tool>
        <img src="/assets/novogen-logo.png" alt="Novogen">
        <span>Configuração inicial</span>
        <h1>Gerar hash da senha</h1>
        <p>O hash será gerado no seu navegador. Depois copie o resultado para ADMIN_PASSWORD_HASH.</p>
        <label>
          Senha forte
          <input type="password" name="password" autocomplete="new-password" required autofocus minlength="12">
        </label>
        <button class="primary-button" type="button" data-hash-submit>Gerar hash</button>
        <textarea rows="5" readonly data-hash-output placeholder="O hash aparecerá aqui"></textarea>
        <small data-hash-status></small>
      </section>
    </section>
    <script>
      const tool = document.querySelector("[data-hash-tool]");
      const submit = document.querySelector("[data-hash-submit]");
      const output = document.querySelector("[data-hash-output]");
      const status = document.querySelector("[data-hash-status]");

      const bytesToBase64 = (bytes) => {
        let binary = "";
        bytes.forEach((byte) => {
          binary += String.fromCharCode(byte);
        });
        return btoa(binary);
      };

      const hashPassword = async (password, iterations = 50000) => {
        const salt = new Uint8Array(16);
        crypto.getRandomValues(salt);
        const key = await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(password),
          "PBKDF2",
          false,
          ["deriveBits"]
        );
        const bits = await crypto.subtle.deriveBits(
          { name: "PBKDF2", hash: "SHA-256", salt, iterations },
          key,
          256
        );
        return \`pbkdf2_sha256$\${iterations}$\${bytesToBase64(salt)}$\${bytesToBase64(new Uint8Array(bits))}\`;
      };

      submit.addEventListener("click", async () => {
        const password = String(tool.querySelector("[name='password']").value || "");
        if (password.length < 12) {
          status.textContent = "Use uma senha com pelo menos 12 caracteres.";
          return;
        }
        status.textContent = "Gerando hash...";
        output.value = await hashPassword(password);
        status.textContent = "Hash gerado. Copie o conteúdo acima.";
        output.focus();
        output.select();
      });
    </script>
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

export async function onRequestPost() {
  return new Response("Method not allowed", { status: 405 });
}
