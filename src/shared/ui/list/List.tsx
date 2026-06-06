import type { ReactNode } from "react";

export type ListItem = {
  id: string;
  label: string;
  description?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
};

type ListProps = {
  items: ListItem[];
  divided?: boolean;
};

export function List({ items, divided = false }: ListProps) {
  return (
    <ul className="flex flex-col">
      {items.map((item, i) => (
        <li key={item.id}>
          <div
            onClick={!item.disabled ? item.onClick : undefined}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150
              ${item.onClick && !item.disabled ? "cursor-pointer hover:bg-zinc-800/60" : "cursor-default"}
              ${item.active ? "bg-zinc-800" : ""}
              ${item.disabled ? "opacity-40 cursor-not-allowed" : ""}
            `}
          >
            {item.leading && (
              <span className="shrink-0 text-zinc-500">{item.leading}</span>
            )}

            <div className="flex-1 min-w-0">
              <p
                className={`text-sm truncate ${item.active ? "text-white" : "text-zinc-300"}`}
              >
                {item.label}
              </p>
              {item.description && (
                <p className="text-xs text-zinc-600 truncate mt-0.5">
                  {item.description}
                </p>
              )}
            </div>

            {item.trailing && (
              <span className="shrink-0 text-zinc-500">{item.trailing}</span>
            )}
          </div>

          {divided && i < items.length - 1 && (
            <div className="mx-3 h-px bg-zinc-800/60" />
          )}
        </li>
      ))}
    </ul>
  );
}
