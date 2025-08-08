import { Suspense } from "react";
import { CartClient } from "./pageClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Cart — SwiftCart",
  description:
    "Review items in your cart and proceed to checkout on SwiftCart.",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">Your Cart</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <CartClient />
      </Suspense>
    </div>
  );
}
