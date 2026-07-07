"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Archive,
  FileText,
  Folder as FolderIcon,
  Grid,
  Star,
  Trash2,
} from "lucide-react";

import { Sidenav, type SidenavNavItem } from "../sidenav/Sidenav";
import { useNoteCounts } from "@/modules/notes";
import {
  FolderQuickCreate,
  folderIconClasses,
  useAllFolders,
} from "@/modules/folders";
import { useAuthActions, useCurrentUser } from "@/modules/auth";

function deriveActiveId(
  pathname: string | null,
  tagParam: string | null,
  folderParam: string | null,
): string | undefined {
  if (tagParam) return `tag:${tagParam}`;
  if (folderParam) return `folder:${folderParam}`;
  if (!pathname) return undefined;
  if (pathname === "/dashboard") return "dashboard";
  if (pathname.startsWith("/dashboard/notes")) return "notes";
  if (pathname.startsWith("/dashboard/favorite")) return "favorite";
  if (pathname.startsWith("/dashboard/archived")) return "archived";
  if (pathname.startsWith("/dashboard/trash")) return "trash";
  return undefined;
}

function useUrlParam(key: string): string | null {
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    const read = () => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      setValue(params.get(key));
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, [key]);

  return value;
}

export function DashboardSidenav() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const pathname = usePathname();
  const tagParam = useUrlParam("tag");
  const folderParam = useUrlParam("folder");

  const { user, isLoading: userLoading } = useCurrentUser();
  const counts = useNoteCounts();
  const { folders } = useAllFolders();

  const [mobileOpen, setMobileOpen] = useState(false);

  const activeId = deriveActiveId(pathname, tagParam, folderParam);

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
    {
      id: "trash",
      label: "Trash",
      icon: <Trash2 size={14} />,
    },
    ...(folders ?? []).map<SidenavNavItem>((folder) => ({
      id: `folder:${folder._id}`,
      label: folder.name,
      icon: (
        <FolderIcon size={13} className={folderIconClasses(folder.color)} />
      ),
      section: "Folders",
    })),
  ];

  return (
    <Sidenav
      items={sidenavItems}
      activeId={activeId}
      user={{ name: user.name || "Unknown", email: user.email ?? "" }}
      open={mobileOpen}
      onOpenChange={setMobileOpen}
      staticSections={["Folders"]}
      sectionActions={{
        Folders: <FolderQuickCreate />,
      }}
      onNavigate={(id) => {
        if (id === "dashboard") {
          router.push("/dashboard");
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
