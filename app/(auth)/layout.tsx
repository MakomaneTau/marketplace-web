interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return <div className="buyer-theme min-h-screen bg-background">{children}</div>;
}
