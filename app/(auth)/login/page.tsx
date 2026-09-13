import { AuthShell } from "@/app/components/auth/AuthShell";
import { LoginForm } from "@/app/components/auth/LoginForm";

type LoginPageProps = {
  searchParams: Promise<{ reason?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { reason } = await searchParams;

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue buying and selling on campus."
      footerText="Don't have an account?"
      footerLinkText="Create an account"
      footerHref="/signup"
      kind="login"
    >
      <LoginForm sessionExpired={reason === "session_expired"} />
    </AuthShell>
  );
}
