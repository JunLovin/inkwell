import { AuthGuard } from "@/modules/auth";
import { AIChatButton } from "@/modules/ai-chat";
import { DashboardSidenav } from "@/shared/layout/dashboard-sidenav";

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
      <AIChatButton />
    </AuthGuard>
  );
}
