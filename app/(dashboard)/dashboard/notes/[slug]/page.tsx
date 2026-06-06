import { NoteDetailPage } from "@/modules/notes";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <NoteDetailPage slug={slug} />;
}
