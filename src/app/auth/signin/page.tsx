import SignInClient from "./SignInClient";

// Optional, keeps this route fully dynamic (no static optimization)
export const dynamic = "force-dynamic";

type SearchParams = { [key: string]: string | string[] | undefined };

export default function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const callbackUrlParam = searchParams?.callbackUrl;
  // callbackUrl can be string | string[] | undefined
  const callbackUrl =
    typeof callbackUrlParam === "string"
      ? callbackUrlParam
      : Array.isArray(callbackUrlParam) && callbackUrlParam.length > 0
      ? callbackUrlParam[0]
      : "/admin";

  return <SignInClient callbackUrl={callbackUrl} />;
}
