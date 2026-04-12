import AuthGuard from "@/shared/components/auth-guard";
import DashboardSidenav from "@/shared/components/layout/Sidenav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <main className="flex h-dvh w-full font-host overflow-hidden">
        <aside>
          <DashboardSidenav />
        </aside>
        {/* TODO: Solve layout scroll problem */}
        <div className="flex-1 p-4 h-full">{children}</div>
      </main>
    </AuthGuard>
  );
}
