"use client";

import { AuthShell } from "@/app/components/auth/AuthShell";
import { LoginForm } from "@/app/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <AuthShell
            title="Welcome"
            description="Sign in to continue to Marketplace"
            footerText="Don't have an account?"
            footerLinkText="Crerate an account"
            footerHref="../signup"
        >
            <LoginForm />
        </AuthShell>
    );
}