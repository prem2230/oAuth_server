"use client";

import { useEffect, useMemo, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

type AuthStatus = "loading" | "signed-out" | "signed-in";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function Home() {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("Checking your session...");

  const initials = useMemo(() => {
    const source = user?.name || user?.email || "";
    return source
      .split(/[ @._-]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [user]);

  const loadSession = async () => {
    setStatus("loading");
    setMessage("Checking your session...");

    try {
      const response = await fetch(`${apiBaseUrl}/auth/me`, {
        credentials: "include",
      });

      if (!response.ok) {
        setUser(null);
        setStatus("signed-out");
        setMessage("Sign in to create a secure browser session.");
        return;
      }

      const data = (await response.json()) as { user: User };

      setUser(data.user);
      setStatus("signed-in");
      setMessage("Your HTTP-only access token cookie is active.");
    } catch {
      setUser(null);
      setStatus("signed-out");
      setMessage("Start the API server on port 4000, then sign in.");
    }
  };

  useEffect(() => {
    void loadSession();
  }, []);

  const signIn = () => {
    window.location.href = `${apiBaseUrl}/auth/google`;
  };

  const signOut = async () => {
    setMessage("Signing out...");

    await fetch(`${apiBaseUrl}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    setStatus("signed-out");
    setMessage("Signed out. The access token cookie has been cleared.");
  };

  return (
    <main className="page-shell">
      <section className="auth-grid" aria-label="OAuth dashboard">
        <div className="intro">
          <div className="brand-row">
            <div className="mark" aria-hidden="true">
              O
            </div>
            <div className="status-pill">
              <span
                className={`status-dot ${status === "signed-in" ? "online" : ""}`}
                aria-hidden="true"
              />
              {status === "signed-in" ? "Session active" : "OAuth ready"}
            </div>
          </div>

          <div className="hero-copy">
            <p className="eyebrow">Google OAuth practice app</p>
            <h1>Secure sign-in for your Express API.</h1>
            <p className="lede">
              A Next.js interface for the existing backend flow. Sign in with
              Google, return to the app, and inspect the profile resolved from
              your server-side session.
            </p>
          </div>

          <div className="feature-strip" aria-label="Authentication features">
            <div className="feature">
              <strong>Backend session</strong>
              <span>JWT storage stays in an HTTP-only cookie.</span>
            </div>
            <div className="feature">
              <strong>Google profile</strong>
              <span>Shows the saved account returned by your database.</span>
            </div>
            <div className="feature">
              <strong>Local workflow</strong>
              <span>Designed for Next on 3000 and Express on 4000.</span>
            </div>
          </div>
        </div>

        <aside className="auth-panel" aria-label="Current account">
          <div className="panel-header">
            <div>
              <h2>Account</h2>
              <p>{status === "signed-in" ? "Authenticated" : "Not signed in"}</p>
            </div>
            <button className="button secondary" type="button" onClick={loadSession}>
              Refresh
            </button>
          </div>

          <div className="profile">
            {status === "signed-in" && user ? (
              <>
                {user.avatarUrl ? (
                  <img className="avatar" src={user.avatarUrl} alt="" />
                ) : (
                  <div className="avatar avatar-fallback" aria-hidden="true">
                    {initials || "U"}
                  </div>
                )}

                <div>
                  <h3>{user.name || "Google user"}</h3>
                  <p>{user.email}</p>
                </div>

                <ul className="detail-list">
                  <li>
                    Email verified
                    <strong>{user.emailVerified ? "Yes" : "No"}</strong>
                  </li>
                  <li>
                    User ID
                    <strong>{user.id}</strong>
                  </li>
                  <li>
                    Provider
                    <strong>Google</strong>
                  </li>
                </ul>
              </>
            ) : (
              <>
                <div className="avatar avatar-fallback" aria-hidden="true">
                  G
                </div>
                <div>
                  <h3>Connect Google</h3>
                  <p>
                    Use the backend OAuth redirect to create or resume your
                    account.
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="actions">
            <div className={`notice ${message.includes("Start") ? "error" : ""}`}>
              {message}
            </div>

            {status === "signed-in" ? (
              <button className="button secondary" type="button" onClick={signOut}>
                Sign out
              </button>
            ) : (
              <button
                className="button primary"
                type="button"
                onClick={signIn}
                disabled={status === "loading"}
              >
                <span className="google-g" aria-hidden="true">
                  G
                </span>
                Continue with Google
              </button>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}
