import SignInClient from "./SignInClient";

export const dynamic = "force-dynamic";

export default function Page({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  const callbackUrl = searchParams?.callbackUrl ?? "/admin";
  return <SignInClient callbackUrl={callbackUrl} />;
}
