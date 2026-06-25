import { Suspense } from "react";
import { ResetPasswordPage } from "@/modules/auth";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPage />
    </Suspense>
  );
}
