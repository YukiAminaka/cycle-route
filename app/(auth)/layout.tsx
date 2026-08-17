export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout">
      <main>
        <div className="auth-content">{children}</div>
      </main>
      <footer className="auth-footer">
        <div className="container px-4 text-center text-sm text-muted-foreground lg:px-6">
          © 2025 CycleRoute. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
