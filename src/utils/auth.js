export async function hashPassword(password) {
  const encoded = new TextEncoder().encode(password);
  const buffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function generateToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

export function createSession(user, token) {
  const session = {
    user: { username: user.username, role: user.role },
    token,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };
  localStorage.setItem("session", JSON.stringify(session));
  return session;
}

export function getSession() {
  const raw = localStorage.getItem("session");
  if (!raw) return null;

  try {
    const session = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem("session");
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem("session");
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem("session");
}
