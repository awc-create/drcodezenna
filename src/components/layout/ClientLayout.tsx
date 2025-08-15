"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
      <Navbar/>
      <main style={{ paddingTop: isHome ? 0 : "var(--navbar-height)" }}>
        {children}
      </main>
      <hr className="newspaper-divider" />
      <Footer />
    </>
  );
}
