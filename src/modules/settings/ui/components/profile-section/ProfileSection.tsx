"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";

import { Avatar, Button, Card, Field, Input } from "@/shared/ui";
import { useToast } from "@/shared/hooks/use-toast";
import {
  useAuthActions,
  useCurrentUser,
} from "@/modules/auth";

export function ProfileSection() {
  const { user, isLoading } = useCurrentUser();
  const { updateProfile } = useAuthActions();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  if (isLoading || !user) {
    return (
      <Card variant="default" padding="lg">
        <p className="text-zinc-500 text-sm">Loading profile…</p>
      </Card>
    );
  }

  const dirty = name.trim() !== (user.name ?? "").trim();

  const handleSave = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      toast.error({
        title: "Name too short",
        description: "Use at least 2 characters.",
      });
      return;
    }
    try {
      setSaving(true);
      await updateProfile(trimmed);
      toast.success({ title: "Profile updated" });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error({
        title: "Could not save profile",
        description: "Try again in a moment.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card variant="default" padding="lg">
        <div className="flex items-start gap-5">
          <Avatar src={undefined} name={user.name ?? user.email ?? "U"} size="lg" />
          <div className="flex-1 min-w-0">
            <h3 className="text-white text-sm font-medium">
              {user.name ?? "Unnamed"}
            </h3>
            <p className="text-zinc-600 text-xs mt-1 flex items-center gap-1.5">
              <Mail size={11} />
              {user.email}
            </p>
            <p className="text-zinc-700 text-[11px] mt-3">
              Avatar uploads coming soon.
            </p>
          </div>
        </div>
      </Card>

      <Card variant="default" padding="lg">
        <div className="space-y-5">
          <div>
            <h3 className="text-white text-sm font-medium tracking-tight">
              Display name
            </h3>
            <p className="text-zinc-600 text-xs mt-1">
              Shown across Inkwell and in your sidenav.
            </p>
          </div>

          <Field label="Name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </Field>

          <Field label="Email">
            <Input
              value={user.email ?? ""}
              disabled
              className="text-zinc-500"
            />
            <p className="text-zinc-700 text-[11px] mt-1.5 px-1">
              Email changes require contacting support.
            </p>
          </Field>

          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              loading={saving}
              disabled={!dirty || saving}
              onClick={handleSave}
            >
              Save changes
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
