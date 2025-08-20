import SignInClient from "./SignInClient";

export const dynamic = "force-dynamic";

type SP = Record<string, string | string[] | undefined>;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const raw = sp?.callbackUrl;
  const callbackUrl =
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "/admin";

  return <SignInClient callbackUrl={callbackUrl} />;
}
