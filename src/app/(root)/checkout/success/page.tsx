export const dynamic = "force-dynamic";

import SuccessClient from "./success-client";
import prismadb from "@/lib/prismadb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Successful — SwiftCart",
  description:
    "Thank you for your purchase! View your order details on SwiftCart.",
  robots: { index: false },
};

export default async function Page(props: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await props.searchParams;

  const products: Array<{ id: string; name: string }> = [];
  if (orderId) {
    const order = await prismadb.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: { productVariant: { include: { product: true } } },
        },
      },
    });
    if (order) {
      const seen = new Set<string>();
      for (const it of order.orderItems) {
        const p = it.productVariant.product;
        if (!seen.has(p.id)) {
          seen.add(p.id);
          products.push({ id: p.id, name: p.name });
        }
      }
    }
  }

  return (
    <div className="container mx-auto py-12">
      <SuccessClient orderId={orderId} products={products} />
    </div>
  );
}
