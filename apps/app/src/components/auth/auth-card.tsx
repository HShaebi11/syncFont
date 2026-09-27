import { AuthSplitLayout } from "@/components/auth/auth-split";

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <AuthSplitLayout title={title} description={description}>
      <div className="auth-form space-y-4">{children}</div>
      {footer}
    </AuthSplitLayout>
  );
}
