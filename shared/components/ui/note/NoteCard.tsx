import { Doc } from "@/convex/_generated/dataModel";

export type Note = Doc<"notes">;
export type NoteStatus = "draft" | "archived";

const defaultCovers = [
  "from-zinc-800 to-zinc-900",
  "from-zinc-900 to-zinc-950",
  "from-slate-800 to-slate-900",
  "from-neutral-800 to-neutral-900",
];

function timeAgo(date: Date) {
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

type NoteCardProps = {
  note: Partial<Note>;
  onClick?: () => void;
};

export function NoteCard({ note, onClick }: NoteCardProps) {
  const cover = defaultCovers[note._id!.charCodeAt(0) % defaultCovers.length];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600"
    >
      <div
        className={`h-28 bg-gradient-to-br ${cover} flex items-end p-3 relative overflow-hidden`}
      >
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.5) 0, rgba(255,255,255,0.5) 1px, transparent 0, transparent 50%)`,
            backgroundSize: "12px 12px",
          }}
        />
      </div>

      <div className="p-4">
        <h3 className="text-sm font-medium text-white truncate group-hover:text-zinc-100 transition-colors">
          {note.title || "Untitled"}
        </h3>

        {note.preview && (
          <p className="text-xs text-zinc-600 mt-1 line-clamp-2 leading-relaxed">
            {note.preview}
          </p>
        )}

        <div className="flex items-center justify-between mt-3">
          {note.updatedAt && (
            <span className="text-[10px] text-zinc-700 shrink-0">
              {timeAgo(new Date(note.updatedAt))}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
