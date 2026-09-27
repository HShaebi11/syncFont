import * as http from "http";
import { shell } from "electron";

import { API_URL, WEB_APP_URL } from "./config";
import { apiFetch, apiJson } from "./api-client";
import { clearSession, store } from "./store";

const AUTH_TIMEOUT_MS = 5 * 60 * 1000;

export interface AuthSession {
  token: string;
  email: string;
}

function parseCallbackUrl(callbackUrl: string): AuthSession | null {
  try {
    const url = new URL(callbackUrl);
    const token = url.searchParams.get("token");
    const email = url.searchParams.get("email");
    if (!token) return null;
    return { token, email: email ?? "Signed in" };
  } catch {
    return null;
  }
}

function startLocalCallbackServer(): Promise<{
  port: number;
  waitForSession: () => Promise<AuthSession>;
  close: () => void;
}> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const session = req.url ? parseCallbackUrl(`http://127.0.0.1${req.url}`) : null;
      const body =
        "<html><body><p>Signed in. You can close this tab and return to Typefolio.</p></body></html>";
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(body);
      if (session) {
        pendingResolve?.(session);
      }
    });

    let pendingResolve: ((session: AuthSession) => void) | null = null;

    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Could not bind auth callback server"));
        return;
      }

      resolve({
        port: address.port,
        waitForSession: () =>
          new Promise<AuthSession>((resolveSession, rejectSession) => {
            pendingResolve = resolveSession;
            setTimeout(() => {
              rejectSession(new Error("Sign-in timed out. Try again."));
            }, AUTH_TIMEOUT_MS);
          }),
        close: () => server.close(),
      });
    });

    server.on("error", reject);
  });
}

export async function completeAuthSession(session: AuthSession): Promise<void> {
  store.set("token", session.token);
  store.set("email", session.email);
  store.set("libraryId", "");
  store.set("lastEtag", "");
  store.set("deviceId", "");
  store.set("installedFontIds", []);
  if (!store.get("apiBaseUrl")) {
    store.set("apiBaseUrl", API_URL);
  }
}

export async function signInWithBrowser(): Promise<AuthSession> {
  const callback = await startLocalCallbackServer();
  try {
    const redirectUri = `http://127.0.0.1:${callback.port}/callback`;
    const authUrl = `${store.get("apiBaseUrl") || API_URL}/auth/desktop?redirect_uri=${encodeURIComponent(redirectUri)}`;
    await shell.openExternal(authUrl);
    const session = await callback.waitForSession();
    await completeAuthSession(session);
    return session;
  } finally {
    callback.close();
  }
}

export async function openSignUpInBrowser(): Promise<void> {
  const redirectUri = encodeURIComponent("typefolio://auth/callback");
  const url = `${store.get("apiBaseUrl") || API_URL}/auth/sign-up?redirect_uri=${redirectUri}`;
  await shell.openExternal(url);
}

export async function openBillingInBrowser(): Promise<void> {
  try {
    const res = await apiJson<{ portalUrl: string }>("/api/billing/portal", {
      method: "POST",
    });
    if (res.status === 200 && res.data?.portalUrl) {
      await shell.openExternal(res.data.portalUrl);
      return;
    }
  } catch {
    /* fall through */
  }
  await shell.openExternal(`${WEB_APP_URL}/settings`);
}

export function handleDeepLink(deepLink: string): AuthSession | null {
  try {
    const parsed = new URL(deepLink);
    if (parsed.hostname !== "auth") return null;
    if (!parsed.pathname.startsWith("/callback")) return null;
    const session = parseCallbackUrl(deepLink);
    if (session) {
      void completeAuthSession(session);
    }
    return session;
  } catch {
    return null;
  }
}

export function signOut(): void {
  clearSession();
}
