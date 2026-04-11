import AuthGuard from "@/shared/components/auth-guard";
import DashboardSidenav from "@/shared/components/layout/Sidenav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <main className="flex h-dvh w-full overflow-y-auto font-host">
        <aside>
          <DashboardSidenav />
        </aside>
        <div className="flex-1 p-4">{children}</div>
      </main>
    </AuthGuard>
  );
}
