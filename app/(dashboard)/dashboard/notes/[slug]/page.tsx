import NotePage from "./NotePage";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <NotePage slug={slug} />;
}
