import { useState } from "react";
import { hashPassword, generateToken, createSession, getSession, clearSession } from "../utils/auth";
import users from "../config/users";
import { AuthContext } from "../hooks/AuthContext";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getSession());

  async function login(username, password) {
    const hash = await hashPassword(password);
    const match = users.find(
      (u) => u.username === username && u.passwordHash === hash
    );

    if (!match) {
      throw new Error("Invalid username or password");
    }

    const token = generateToken();
    const newSession = createSession(match, token);
    setSession(newSession);
  }

  function logout() {
    clearSession();
    setSession(null);
  }

  const value = {
    user: session?.user ?? null,
    isAuthenticated: !!session,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

