// Server component (Next 15): awaits Promise-typed searchParams and passes to client

import UnsubscribeClient from "./UnsubscribeClient";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; email?: string }>;
}) {
  const { t, email } = await searchParams;

  return <UnsubscribeClient token={t ?? ""} initialEmail={email ?? ""} />;
}
