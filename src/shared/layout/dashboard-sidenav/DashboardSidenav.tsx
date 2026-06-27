"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  FileText,
  Folder as FolderIcon,
  Grid,
  Star,
} from "lucide-react";

import { Sidenav, type SidenavNavItem } from "../sidenav/Sidenav";
import { useNoteCounts } from "@/modules/notes";
import { tagSwatchClasses, useAllTags } from "@/modules/tags";
import { folderIconClasses, useAllFolders } from "@/modules/folders";
import {
  useAuthActions,
  useCurrentUser,
} from "@/modules/auth";

export function DashboardSidenav() {
  const { signOut } = useAuthActions();
  const router = useRouter();

  const { user, isLoading: userLoading } = useCurrentUser();
  const counts = useNoteCounts();
  const { tags } = useAllTags();
  const { folders } = useAllFolders();

  const [mobileOpen, setMobileOpen] = useState(false);

  if (userLoading || !user) {
    return (
      <div className="flex items-center justify-center h-dvh w-3xs">
        <span className="text-zinc-500 text-xs text-center mx-auto">
          loading...
        </span>
      </div>
    );
  }

  const sidenavItems: SidenavNavItem[] = [
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
    ...(folders ?? []).map<SidenavNavItem>((folder) => ({
      id: `folder:${folder._id}`,
      label: folder.name,
      icon: (
        <FolderIcon
          size={13}
          className={folderIconClasses(folder.color)}
        />
      ),
      section: "Folders",
    })),
    ...(tags ?? []).map<SidenavNavItem>((tag) => ({
      id: `tag:${tag._id}`,
      label: tag.name,
      icon: (
        <span
          className={`w-2 h-2 rounded-full ${tagSwatchClasses(tag.color)}`}
        />
      ),
      section: "Tags",
    })),
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
        if (id.startsWith("tag:")) {
          const tagId = id.slice("tag:".length);
          router.push(`/dashboard/notes?tag=${tagId}`);
          return;
        }
        if (id.startsWith("folder:")) {
          const folderId = id.slice("folder:".length);
          router.push(`/dashboard/notes?folder=${folderId}`);
          return;
        }
        router.push(`/dashboard/${id}`);
      }}
      onLogout={() => signOut()}
      onSettings={() => router.push("/dashboard/settings")}
    />
  );
}
