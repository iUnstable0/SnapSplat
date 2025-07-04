export default async function Page({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return <h1>Public Gallery {eventId}</h1>;
}
