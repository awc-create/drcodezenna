import { Suspense } from "react";
import SignInClient from "./SignInClient";

export const dynamic = "force-dynamic"; // avoid prerender issues during build

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SignInClient />
    </Suspense>
  );
}
