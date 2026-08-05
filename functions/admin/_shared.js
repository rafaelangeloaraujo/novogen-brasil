const SESSION_COOKIE = "novogen_admin";
const CSRF_COOKIE = "novogen_csrf";
const SESSION_MAX_AGE = 60 * 60 * 8;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCK_SECONDS = 60 * 10;

export function htmlResponse(html, init = {}) {
  return new Response(html, {
    status: init.status || 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      ...(init.headers || {})
    }
  });
}

function responseHeaders(input = {}) {
  const headers = new Headers();
  Object.entries(input).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => headers.append(key, item));
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  });
  return headers;
}

export function jsonResponse(data, init = {}) {
  return new Response(JSON.stringify(data), {
    status: init.status || 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...(init.headers || {})
    }
  });
}

export function redirect(location, headers = {}) {
  const responseHeadersObject = responseHeaders({
    Location: location,
    "Cache-Control": "no-store",
    ...headers
  });

  return new Response(null, {
    status: 302,
    headers: responseHeadersObject
  });
}

export function parseCookies(request) {
  const header = request.headers.get("Cookie") || "";
  return Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        if (index === -1) return [part, ""];
        return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      })
  );
}

export function cookie(name, value, options = {}) {
  const segments = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax"
  ];

  if (options.maxAge !== undefined) segments.push(`Max-Age=${options.maxAge}`);
  if (options.secure !== false) segments.push("Secure");
  if (options.expires) segments.push(`Expires=${options.expires}`);

  return segments.join("; ");
}

export function clearCookie(name) {
  return cookie(name, "", {
    maxAge: 0,
    expires: "Thu, 01 Jan 1970 00:00:00 GMT"
  });
}

function bytesToBase64(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(base64) {
  const padded = `${base64}${"=".repeat((4 - (base64.length % 4)) % 4)}`;
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

function base64UrlToBytes(base64Url) {
  return base64ToBytes(base64Url.replace(/-/g, "+").replace(/_/g, "/"));
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a[index] ^ b[index];
  }
  return diff === 0;
}

export function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function hashPassword(password, iterations = 50000) {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256
  );
  return `pbkdf2_sha256$${iterations}$${bytesToBase64(salt)}$${bytesToBase64(new Uint8Array(bits))}`;
}

export async function verifyPassword(password, storedHash) {
  const parts = String(storedHash || "").split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2_sha256") return false;
  const iterations = Number(parts[1]);
  if (!Number.isFinite(iterations) || iterations < 10000) return false;

  const salt = base64ToBytes(parts[2]);
  const expected = base64ToBytes(parts[3]);
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    expected.length * 8
  );

  return timingSafeEqual(new Uint8Array(bits), expected);
}

export async function signSession(payload, secret) {
  const encodedPayload = bytesToBase64(new TextEncoder().encode(JSON.stringify(payload)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(encodedPayload));
  const encodedSignature = bytesToBase64(new Uint8Array(signature)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${encodedPayload}.${encodedSignature}`;
}

export async function verifySession(token, secret) {
  const [encodedPayload, encodedSignature] = String(token || "").split(".");
  if (!encodedPayload || !encodedSignature) return null;
  let payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(encodedPayload)));
  } catch (error) {
    return null;
  }

  const expected = await signSession(payload, secret);
  const actualBytes = new TextEncoder().encode(`${encodedPayload}.${encodedSignature}`);
  const expectedBytes = new TextEncoder().encode(expected);
  if (!timingSafeEqual(actualBytes, expectedBytes)) return null;

  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

export function sessionSecret(env) {
  return env.ADMIN_SESSION_SECRET || env.NOVOGEN_SESSION_SECRET || "troque-este-segredo-no-cloudflare";
}

export async function requireAdmin(context) {
  const cookies = parseCookies(context.request);
  const session = await verifySession(cookies[SESSION_COOKIE], sessionSecret(context.env));
  return session?.username ? session : null;
}

export function sessionCookies(token, csrfToken) {
  return [
    cookie(SESSION_COOKIE, token, { maxAge: SESSION_MAX_AGE }),
    cookie(CSRF_COOKIE, csrfToken, { maxAge: SESSION_MAX_AGE })
  ];
}

export function clearSessionCookies() {
  return [clearCookie(SESSION_COOKIE), clearCookie(CSRF_COOKIE)];
}

export function csrfFromRequest(request) {
  return parseCookies(request)[CSRF_COOKIE] || "";
}

export function normalizeCmsContent(content) {
  return {
    text: typeof content?.text === "object" && content.text !== null ? content.text : {},
    assets: typeof content?.assets === "object" && content.assets !== null ? content.assets : {},
    links: typeof content?.links === "object" && content.links !== null ? content.links : {},
    seo: typeof content?.seo === "object" && content.seo !== null ? content.seo : {}
  };
}

export async function ensureDatabase(env) {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TEXT,
    last_login_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();

  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS cms_content (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    content_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();

  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor TEXT,
    action TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    meta_json TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();

  await env.DB.prepare(`INSERT OR IGNORE INTO cms_content (id, content_json)
    VALUES (1, ?)`)
    .bind(JSON.stringify({
      text: {},
      assets: {},
      links: {
        "link.social.instagram": "https://www.instagram.com/novogen_brasil/",
        "link.social.linkedin": "https://www.linkedin.com/company/novogen-do-brasil/"
      },
      seo: {}
    }))
    .run();

  if (env.ADMIN_USER && env.ADMIN_PASSWORD_HASH) {
    await env.DB.prepare(`INSERT INTO admins (username, password_hash, is_active)
      VALUES (?, ?, 1)
      ON CONFLICT(username) DO UPDATE SET
        password_hash = excluded.password_hash,
        is_active = 1,
        updated_at = CURRENT_TIMESTAMP`)
      .bind(env.ADMIN_USER, env.ADMIN_PASSWORD_HASH)
      .run();
  }
}

export async function logAction(env, request, actor, action, meta = {}) {
  await env.DB.prepare(`INSERT INTO audit_logs (actor, action, ip_address, user_agent, meta_json)
    VALUES (?, ?, ?, ?, ?)`)
    .bind(
      actor || null,
      action,
      request.headers.get("CF-Connecting-IP") || "",
      (request.headers.get("User-Agent") || "").slice(0, 500),
      JSON.stringify(meta)
    )
    .run();
}

export { SESSION_COOKIE, CSRF_COOKIE, MAX_LOGIN_ATTEMPTS, LOGIN_LOCK_SECONDS };
