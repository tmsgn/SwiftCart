"use client";

import { useEffect } from "react";
import { useCart } from "@/hooks/use-cart";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import RatingForm from "@/components/reviews/rating-form";

export default function SuccessClient({
  orderId,
  products = [],
}: {
  orderId?: string;
  products?: Array<{ id: string; name: string }>;
}) {
  const { clear } = useCart();

  useEffect(() => {
    // Clear the cart once on success
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="text-center max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2">
          Thank you for your purchase!
        </h1>
        <p className="text-muted-foreground">
          {orderId
            ? `Your order (${orderId}) has been placed successfully.`
            : "Your order has been placed successfully."}
        </p>
      </div>

      {products.length > 0 && (
        <div className="text-left">
          <h2 className="text-xl font-semibold mb-3">Rate your products</h2>
          <div className="space-y-6">
            {products.map((p) => (
              <div key={p.id} className="border rounded-lg p-4">
                <div className="mb-2 font-medium">{p.name}</div>
                <RatingForm productId={p.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center gap-3 pt-2">
        <Button asChild>
          <Link href="/">Continue shopping</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/seller">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
