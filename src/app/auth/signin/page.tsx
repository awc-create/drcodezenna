import SignInClient from "./SignInClient";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  return <SignInClient callbackUrl={callbackUrl ?? "/admin"} />;
}