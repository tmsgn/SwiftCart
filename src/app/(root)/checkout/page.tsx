export const dynamic = "force-dynamic";

import CheckoutClient from "./checkout-client";
import { getDefaultAddress } from "@/app/_actions/addresses";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout — SwiftCart",
  description: "Securely complete your purchase on SwiftCart.",
  robots: { index: false },
};

export default async function Page() {
  const addr = await getDefaultAddress();

  const defaults = addr
    ? {
        street: addr.street || undefined,
        country: addr.country || undefined,
        state: addr.state || undefined,
        city: addr.city || undefined,
        postalCode: addr.postalCode || undefined,
      }
    : undefined;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">Checkout</h1>
      <CheckoutClient defaults={defaults} />
    </div>
  );
}
