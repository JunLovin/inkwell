import AuthGuard from "@/shared/components/auth-guard";
import DashboardSidenav from "@/shared/components/layout/Sidenav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <main className="flex h-screen min-h-0 w-full font-host">
        <aside>
          <DashboardSidenav />
        </aside>
        <div className="flex-1 p-4 h-full overflow-y-auto min-h-0">
          {children}
        </div>
      </main>
    </AuthGuard>
  );
}
