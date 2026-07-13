"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      router.replace("/");
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [router]);

  return (
    <main className="page-shell">
      <section className="center-card" aria-live="polite">
        <p className="eyebrow">Signed in</p>
        <h1>Google login complete.</h1>
        <p>Taking you back to the account dashboard.</p>
        <Link className="button primary" href="/">
          Open dashboard
        </Link>
      </section>
    </main>
  );
}
