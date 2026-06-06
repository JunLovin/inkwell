"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, FileText, Grid, Star } from "lucide-react";

import { Sidenav } from "../sidenav/Sidenav";
import { useAllNotes } from "@/modules/notes";
import {
  useAuthActions,
  useCurrentUser,
} from "@/modules/auth";
import { countByStatus } from "@/modules/notes/domain/services/note-filter";

export function DashboardSidenav() {
  const { signOut } = useAuthActions();
  const router = useRouter();

  const { user, isLoading: userLoading } = useCurrentUser();
  const { notes, isLoading: notesLoading } = useAllNotes();

  const [mobileOpen, setMobileOpen] = useState(false);

  if (userLoading || notesLoading || !user || !notes) {
    return (
      <div className="flex items-center justify-center h-dvh w-3xs">
        <span className="text-zinc-500 text-xs text-center mx-auto">
          loading...
        </span>
      </div>
    );
  }

  const counts = countByStatus(notes);

  const sidenavItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <Grid size={14} />,
    },
    {
      id: "notes",
      label: "Notes",
      icon: <FileText size={14} />,
      badge: counts.active,
    },
    {
      id: "favorite",
      label: "Favorite",
      icon: <Star size={14} />,
      badge: counts.favorite,
    },
    {
      id: "archived",
      label: "Archived",
      icon: <Archive size={14} />,
      badge: counts.archived,
    },
  ];

  return (
    <Sidenav
      items={sidenavItems}
      user={{ name: user.name || "Unknown", email: user.email! }}
      open={mobileOpen}
      onOpenChange={setMobileOpen}
      onNavigate={(id) => {
        if (id === "dashboard") {
          router.push("/dashboard");
          return;
        }
        router.push(`/dashboard/${id}`);
      }}
      onLogout={() => signOut()}
      onSettings={() => router.push("/dashboard/settings")}
    />
  );
}
