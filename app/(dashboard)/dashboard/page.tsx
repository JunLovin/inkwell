"use client";

import { api } from "@/convex/_generated/api";
import { Card, Loader } from "@/shared/components/ui";
import { useQuery } from "convex/react";
import { useMemo } from "react";

export default function DashboardPage() {
  const notes = useQuery(api.myFunctions.getNotes, {});

  const stats = useMemo(() => {
    if (!notes) return { total: 0, favorite: 0, archived: 0 };

    return {
      total: notes.length,
      favorite: notes.filter((note) => note.isFavorite).length,
      archived: notes.filter((note) => note.isArchived).length,
    };
  }, [notes]);

  const statistics = [
    { label: "Total Notes", value: stats.total },
    { label: "Favorite Notes", value: stats.favorite },
    { label: "Archived Notes", value: stats.archived },
  ];

  if (!notes) {
    return (
      <div className="flex items-center justify-center h-dvh">
        <Loader variant="circle" size="lg" />
      </div>
    );
  }

  return (
    <>
      <div>
        <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
        <div className="grid grid-cols-3 gap-4">
          {statistics.map((stat) => (
            <Card key={stat.label} className="p-4">
              <h2 className="text-lg font-medium text-gray-500">
                {stat.label}
              </h2>
              <p className="text-2xl font-bold">{stat.value}</p>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
