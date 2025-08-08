"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "swiftcart:cart";
const CART_EVENT = "swiftcart:cart-changed";

export type CartItem = {
  id: string; // equals productVariantId
  productVariantId: string;
  quantity: number;
  price: number; // snapshot unit price
  productName: string;
  imageUrl?: string;
  attributes?: Record<string, string>; // e.g., { Color: "Blue", Size: "M" }
};

export type CartItemInput = Omit<CartItem, "id"> & { id?: string };

function readStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return data as CartItem[];
    return [];
  } catch {
    return [];
  }
}

function writeStorage(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  // Notify all listeners in this tab
  try {
    window.dispatchEvent(
      new CustomEvent(CART_EVENT, { detail: { items } } as CustomEventInit)
    );
  } catch {}
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initial load
    setItems(readStorage());

    // Sync when cart changes in this tab
    const sync = () => setItems(readStorage());
    const onCustom = () => sync();
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) sync();
    };

    window.addEventListener(CART_EVENT, onCustom as EventListener);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(CART_EVENT, onCustom as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const save = useCallback((next: CartItem[]) => {
    setItems(next);
    writeStorage(next);
  }, []);

  const total = useMemo(() => {
    return items.reduce(
      (sum, it) => sum + Number(it.price || 0) * it.quantity,
      0
    );
  }, [items]);

  const add = useCallback(
    async (input: CartItemInput) => {
      setLoading(true);
      try {
        const id = input.id || input.productVariantId;
        const next = [...items];
        const idx = next.findIndex(
          (x) => x.productVariantId === input.productVariantId
        );
        if (idx >= 0) {
          next[idx] = {
            ...next[idx],
            quantity: next[idx].quantity + (input.quantity || 1),
            price: input.price ?? next[idx].price,
          };
        } else {
          next.push({
            id,
            productVariantId: input.productVariantId,
            quantity: input.quantity || 1,
            price: input.price,
            productName: input.productName,
            imageUrl: input.imageUrl,
            attributes: input.attributes,
          });
        }
        save(next);
        toast.success("Added to cart");
      } finally {
        setLoading(false);
      }
    },
    [items, save]
  );

  const update = useCallback(
    async (id: string, quantity: number) => {
      const next = items
        .map((it) => (it.id === id ? { ...it, quantity } : it))
        .filter((it) => it.quantity > 0);
      save(next);
    },
    [items, save]
  );

  const remove = useCallback(
    async (id: string) => {
      const next = items.filter((it) => (it.id === id ? false : true));
      save(next);
    },
    [items, save]
  );

  const clear = useCallback(() => {
    save([]);
  }, [save]);

  const refresh = useCallback(() => {
    setItems(readStorage());
  }, []);

  return { items, total, loading, add, update, remove, clear, refresh };
}
