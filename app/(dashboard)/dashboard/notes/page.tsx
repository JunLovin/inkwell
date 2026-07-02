import { Suspense } from "react";
import { NotesListPage } from "@/modules/notes";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <NotesListPage />
    </Suspense>
  );
}
