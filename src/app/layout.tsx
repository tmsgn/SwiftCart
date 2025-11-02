import "@/app/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SwiftCart",
  description: "The best place to buy your favorite products.",
};

export const dynamic = "force-dynamic";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ClerkProvider>
        <body className={poppins.className}>
          <Toaster richColors position="top-right" />
          <main>{children}</main>
        </body>
      </ClerkProvider>
    </html>
  );
}
