"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2, TriangleAlert } from "lucide-react";

import { Button, Card, Dialog, Input } from "@/shared/ui";
import { useToast } from "@/shared/hooks/use-toast";
import { useAllNotes } from "@/modules/notes";
import { useAuthActions } from "@/modules/auth";
import {
  buildExportFilename,
  buildExportPayload,
  isDeleteConfirmed,
} from "./services";

export function DangerZoneSection() {
  const { notes, isLoading } = useAllNotes();
  const { deleteAccount, signOut } = useAuthActions();
  const { toast } = useToast();
  const router = useRouter();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleExport = () => {
    const payload = buildExportPayload(notes);
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = buildExportFilename();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success({
      title: "Export downloaded",
      description: `${payload.noteCount} note${payload.noteCount === 1 ? "" : "s"} saved to your device.`,
    });
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteAccount();
      await signOut();
      toast.success({
        title: "Account deleted",
        description: "Your notes and account have been removed.",
      });
      router.push("/");
    } catch {
      toast.error({
        title: "Could not delete account",
        description: "Try again in a moment.",
      });
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
      setConfirmText("");
    }
  };

  return (
    <div className="space-y-4">
      <Card
        variant="default"
        padding="lg"
        className="border-red-900/40 bg-red-950/10"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <h3 className="text-white text-sm font-medium tracking-tight flex items-center gap-2">
              <Download size={14} className="text-zinc-400" />
              Export my notes
            </h3>
            <p className="text-zinc-500 text-xs mt-1 max-w-md leading-relaxed">
              Download every note as a single JSON file. Includes archived and
              favorited notes. Take your data with you, anytime.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download size={13} />}
            disabled={isLoading || (notes?.length ?? 0) === 0}
            onClick={handleExport}
          >
            Download JSON
          </Button>
        </div>
      </Card>

      <Card
        variant="default"
        padding="lg"
        className="border-red-900/40 bg-red-950/10"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <h3 className="text-white text-sm font-medium tracking-tight flex items-center gap-2">
              <TriangleAlert size={14} className="text-red-400" />
              Delete account
            </h3>
            <p className="text-zinc-500 text-xs mt-1 max-w-md leading-relaxed">
              Permanently delete your Inkwell account and every note tied to it.
              This action cannot be undone.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 size={13} />}
            onClick={() => setDeleteOpen(true)}
          >
            Delete account
          </Button>
        </div>
      </Card>

      <Dialog
        open={deleteOpen}
        onClose={() => {
          if (!deleting) {
            setDeleteOpen(false);
            setConfirmText("");
          }
        }}
        title="Delete your account?"
        description="Your notes, favorites, archive, and account will be permanently removed. We won't be able to recover them."
        size="md"
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-red-900/40 bg-red-950/20 px-4 py-3">
            <p className="text-red-300/80 text-xs leading-relaxed">
              {notes?.length ?? 0} note
              {(notes?.length ?? 0) === 1 ? "" : "s"} will be deleted.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-500 text-xs tracking-wide uppercase">
              Type DELETE to confirm
            </label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={deleting}
              onClick={() => {
                setDeleteOpen(false);
                setConfirmText("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={deleting}
              disabled={!isDeleteConfirmed(confirmText) || deleting}
              onClick={handleDelete}
            >
              Permanently delete
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
