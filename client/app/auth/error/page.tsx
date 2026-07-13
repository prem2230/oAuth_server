import Link from "next/link";

interface AuthErrorPageProps {
  searchParams: Promise<{
    message?: string;
  }>;
}

export default async function AuthErrorPage({
  searchParams,
}: AuthErrorPageProps) {
  const { message } = await searchParams;

  return (
    <main className="page-shell">
      <section className="center-card">
        <p className="eyebrow">Authentication error</p>
        <h1>Google login did not finish.</h1>
        <p>{message || "Please try signing in again."}</p>
        <Link className="button primary" href="/">
          Return home
        </Link>
      </section>
    </main>
  );
}
