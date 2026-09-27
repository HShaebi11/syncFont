"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { bootstrapDesktopApi, refreshApiToken } from "@/desktop-api";

type SessionState = {
  signedIn: boolean;
  email: string;
  apiBaseUrl: string;
  loading: boolean;
  refresh: () => Promise<void>;
  signInWithBrowser: () => Promise<void>;
  openSignUpInBrowser: () => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [apiBaseUrl, setApiBaseUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const session = await window.typefolioDesktop.getSession();
    refreshApiToken(session.token, session.apiBaseUrl);
    setSignedIn(session.signedIn);
    setEmail(session.email);
    setApiBaseUrl(session.apiBaseUrl);
  }, []);

  useEffect(() => {
    void (async () => {
      const boot = await bootstrapDesktopApi();
      setSignedIn(boot.signedIn);
      setEmail(boot.email);
      setApiBaseUrl(boot.apiBaseUrl);
      setLoading(false);
    })();

    return window.typefolioDesktop.onSessionChanged((session: { signedIn: boolean; email: string }) => {
      void refresh().then(() => {
        setSignedIn(session.signedIn);
        setEmail(session.email);
      });
    });
  }, [refresh]);

  const signInWithBrowser = useCallback(async () => {
    await window.typefolioDesktop.signInWithBrowser();
    await refresh();
    setSignedIn(true);
  }, [refresh]);

  const openSignUpInBrowser = useCallback(async () => {
    await window.typefolioDesktop.openSignUpInBrowser();
  }, []);

  const signOut = useCallback(async () => {
    await window.typefolioDesktop.signOut();
    setSignedIn(false);
    setEmail("");
  }, []);

  const value = useMemo(
    () => ({
      signedIn,
      email,
      apiBaseUrl,
      loading,
      refresh,
      signInWithBrowser,
      openSignUpInBrowser,
      signOut,
    }),
    [
      signedIn,
      email,
      apiBaseUrl,
      loading,
      refresh,
      signInWithBrowser,
      openSignUpInBrowser,
      signOut,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession requires SessionProvider");
  return ctx;
}
