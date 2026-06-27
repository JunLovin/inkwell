import { AuthGuard } from "@/modules/auth";
import { AIChatButton } from "@/modules/ai-chat";
import { DashboardSidenav } from "@/shared/layout/dashboard-sidenav";
import { ErrorBoundary } from "@/shared/providers/error-boundary";
import { ContentWrapper } from "./content-wrapper";

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
        <ContentWrapper>
          <ErrorBoundary>{children}</ErrorBoundary>
        </ContentWrapper>
      </main>
      <AIChatButton />
    </AuthGuard>
  );
}
