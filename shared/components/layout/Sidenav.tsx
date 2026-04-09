"use client";

import { useQuery } from "convex/react";
import { Loader, Sidenav } from "../ui";
import { Archive, FileText, Grid, Star } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";

export default function DashboardSidenav() {
  const { signOut } = useAuthActions();
  const router = useRouter();

  const user = useQuery(api.myFunctions.getUserInfo);

  const [mobileOpen, setMobileOpen] = useState(false);

  const sidenavItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <Grid size={14} />,
      badge: 12,
    },
    { id: "notes", label: "Notes", icon: <FileText size={14} />, badge: 12 },
    { id: "favorite", label: "Favorite", icon: <Star size={14} />, badge: 12 },
    {
      id: "archived",
      label: "Archived",
      icon: <Archive size={14} />,
      badge: 12,
    },
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center h-dvh">
        <Loader variant="circle" size="lg" />
      </div>
    );
  }

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
