import { request } from "./api";

export type UserRole = "ADMIN" | "CUSTOMER";
export type BrowserLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
};
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  location: string;
  browserLocation?: BrowserLocation | null;
  role: UserRole;
};
export type AuthSession = { token: string; user: AuthUser };

const TOKEN_KEY = "reciptile_token";
const USER_KEY = "reciptile_user";

function store(session: AuthSession) {
  sessionStorage.setItem(TOKEN_KEY, session.token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(session.user));
  return session;
}

function tokenIsExpired(token: string) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return true;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const bytes = Uint8Array.from(atob(padded), (character) =>
      character.charCodeAt(0),
    );
    const claims = JSON.parse(new TextDecoder().decode(bytes)) as {
      exp?: number;
    };
    return typeof claims.exp !== "number" || claims.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function currentSession(): AuthSession | null {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const user = sessionStorage.getItem(USER_KEY);
  if (!token || !user || tokenIsExpired(token)) {
    signOut();
    return null;
  }
  try {
    return { token, user: JSON.parse(user) as AuthUser };
  } catch {
    signOut();
    return null;
  }
}

export function signOut() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthSession>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }).then(store),
  register: (
    name: string,
    email: string,
    password: string,
    browserLocation: BrowserLocation | null,
  ) =>
    request<AuthSession>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, browserLocation }),
    }).then(store),
  prepareCheckout: (productIds: string[]) =>
    request<{ status: string }>("/api/checkout/prepare", {
      method: "POST",
      body: JSON.stringify({ productIds }),
    }),
};
