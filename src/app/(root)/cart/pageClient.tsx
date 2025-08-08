"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash } from "lucide-react";

export function CartClient() {
  const { items, total, loading, update, remove, clear } = useCart();

  if (!loading && items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-muted-foreground">Your cart is empty.</p>
        <Button asChild className="mt-6">
          <Link href="/">Continue shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => {
          const attrs = item.attributes
            ? Object.entries(item.attributes)
                .map(([k, v]) => `${k}: ${v}`)
                .join(" · ")
            : "";
          const unitPrice = Number(item.price ?? 0);
          const lineTotal = unitPrice * item.quantity;

          return (
            <div
              key={item.id}
              className="flex gap-4 items-center border rounded-xl p-3"
            >
              <div className="relative w-20 h-20 rounded-md overflow-hidden border">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="flex-1">
                <div className="font-medium">{item.productName}</div>
                <div className="text-sm text-muted-foreground">{attrs}</div>
                <div className="mt-1 font-semibold">
                  ${unitPrice.toFixed(2)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => update(item.id, item.quantity - 1)}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => update(item.id, item.quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="font-semibold">${lineTotal.toFixed(2)}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(item.id)}
                  aria-label="Remove item"
                >
                  <Trash className="w-5 h-5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border rounded-xl p-4 h-fit space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold">${total.toFixed(2)}</span>
        </div>
        <Separator className="my-2" />
        <Button asChild className="w-full">
          <Link href="/checkout">Checkout</Link>
        </Button>
        <Button variant="outline" className="w-full" onClick={() => clear()}>
          Clear cart
        </Button>
      </div>
    </div>
  );
}
