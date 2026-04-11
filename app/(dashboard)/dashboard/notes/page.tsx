"use client";

import { api } from "@/convex/_generated/api";
import { useToast } from "@/lib/hooks/useToast";
import { Button } from "@/shared/components/ui";
import { useMutation } from "convex/react";

export default function NotesPage() {
  const { toast } = useToast();

  const createNote = useMutation(api.myFunctions.addNote);

  const handleCreateNote = async () => {
    try {
      await createNote({ title: "New Note", content: "This is a new note." });
      toast.success({
        title: "Note created",
        description: "Your note has been created successfully.",
      });
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error({
        title: "Failed to create note",
        description: "Something went wrong, try again later.",
      });
    }
  };

  return (
    <>
      <div>
        <h1 className="text-4xl font-bold mb-4">Notes</h1>
        <Button onClick={handleCreateNote} variant="primary" size="lg">
          Create Note
        </Button>
      </div>
    </>
  );
}
