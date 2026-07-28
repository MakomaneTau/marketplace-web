import { AuthShell } from "@/app/components/auth/AuthShell";
import { SignupForm } from "@/app/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Join the marketplace and start buying or selling."
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerHref="../login"
    >
      <SignupForm />
    </AuthShell>
  );
}
