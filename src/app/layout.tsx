import '@/styles/Global.scss';
import { Playfair_Display } from "next/font/google";
import type { Metadata } from "next";
import ClientLayout from "@/components/layout/ClientLayout";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dr. Code | Odera Ezenna",
  description: "Crafted in language, carried by purpose.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={playfair.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
