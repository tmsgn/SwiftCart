"use client";

import { useCart } from "@/hooks/use-cart";
import { placeOrderAction } from "@/app/_actions/checkout";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useMemo, useRef, useState } from "react";
import LocationSelector, {
  type LocationValue,
} from "@/components/ui/location-input";

type Defaults = {
  street?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
};

export default function CheckoutClient({ defaults }: { defaults?: Defaults }) {
  const { items } = useCart();
  const subtotal = useMemo(
    () =>
      items.reduce((sum, it) => sum + Number(it.price || 0) * it.quantity, 0),
    [items]
  );

  const [loc, setLoc] = useState<LocationValue>({});
  const streetRef = useRef<HTMLInputElement>(null);

  function useSavedAddress() {
    if (streetRef.current) streetRef.current.value = defaults?.street || "";
    setLoc({
      country: defaults?.country,
      state: defaults?.state,
      city: defaults?.city,
      postalCode: defaults?.postalCode,
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {items.length === 0 ? (
          <div className="text-muted-foreground">Your cart is empty.</div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 items-center border rounded-xl p-3"
            >
              <div className="relative w-16 h-16 rounded-md overflow-hidden border">
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
                <div className="text-sm text-muted-foreground">
                  {item.attributes
                    ? Object.entries(item.attributes)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" · ")
                    : null}
                </div>
                <div className="mt-1">Qty: {item.quantity}</div>
              </div>
              <div className="font-semibold">
                ${Number(item.price).toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>

      <form
        action={placeOrderAction}
        className="border rounded-xl p-4 h-fit space-y-3"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Saved address</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={useSavedAddress}
            disabled={!defaults}
          >
            Use saved
          </Button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Street</label>
          <input
            ref={streetRef}
            name="shippingStreet"
            className="w-full border rounded-md px-3 py-2"
            placeholder="123 Main St"
            defaultValue=""
            required
          />
        </div>

        {/* Location selectors (country / state / city) and postal code */}
        <LocationSelector value={loc} onChange={(value) => setLoc(value)} />

        {/* Hidden fields submitted to server action */}
        <input type="hidden" name="shippingCountry" value={loc.country || ""} />
        <input type="hidden" name="shippingState" value={loc.state || ""} />
        <input type="hidden" name="shippingCity" value={loc.city || ""} />
        <input
          type="hidden"
          name="shippingPostalCode"
          value={loc.postalCode || ""}
        />

        {/* Hidden cart payload: only variant ids and quantities */}
        <input
          type="hidden"
          name="items"
          value={JSON.stringify(
            items.map((it) => ({
              productVariantId: it.productVariantId,
              quantity: it.quantity,
            }))
          )}
        />

        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold">${subtotal.toFixed(2)}</span>
        </div>
        <Button type="submit" className="w-full" disabled={items.length === 0}>
          Place order
        </Button>
      </form>
    </div>
  );
}
