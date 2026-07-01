import { AuthGuard } from "@/modules/auth";
import { AIChatButton, AIChatPanel } from "@/modules/ai-chat";
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
      <div className="flex h-screen min-h-0 w-full font-host">
        <DashboardSidenav />
        <ContentWrapper>
          <ErrorBoundary>{children}</ErrorBoundary>
        </ContentWrapper>
      </div>
      <AIChatButton />
      <AIChatPanel />
    </AuthGuard>
  );
}
