"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

const isEcommerce = process.env.NEXT_PUBLIC_SITE_MODE === "ecommerce";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
      <Navbar/>
      <main style={{ paddingTop: isHome ? 0 : "var(--navbar-height)" }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
