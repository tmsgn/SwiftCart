"use server";

import prismadb from "@/lib/prismadb";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Prisma } from "../../../generated/prisma";

export async function placeOrderAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress || "";
  const name =
    user?.fullName || user?.firstName || user?.username || email || "Customer";

  const itemsRaw = String(formData.get("items") || "[]");
  const shippingStreet = String(formData.get("shippingStreet") || "").trim();
  const shippingCity = String(formData.get("shippingCity") || "").trim();
  const shippingState = String(formData.get("shippingState") || "").trim();
  const shippingCountry = String(formData.get("shippingCountry") || "").trim();
  const shippingPostalCode = String(
    formData.get("shippingPostalCode") || ""
  ).trim();

  if (
    !shippingStreet ||
    !shippingCity ||
    !shippingPostalCode ||
    !shippingCountry
  ) {
    throw new Error("Missing shipping information");
  }

  let items: Array<{ productVariantId: string; quantity: number }> = [];
  try {
    items = JSON.parse(itemsRaw);
  } catch (e) {
    throw new Error("Invalid items payload");
  }

  items = items.filter(
    (i) => i && i.productVariantId && Number(i.quantity) > 0
  );
  if (items.length === 0) {
    throw new Error("Cart is empty");
  }

  // Fetch variants and related products
  const variantIds = items.map((i) => i.productVariantId);
  type VariantWithProduct = Prisma.ProductVariantGetPayload<{
    include: { product: true };
  }>;

  const variants: VariantWithProduct[] = await prismadb.productVariant.findMany(
    {
      where: { id: { in: variantIds } },
      include: { product: true },
    }
  );

  if (variants.length !== variantIds.length) {
    throw new Error("Some items no longer exist");
  }

  // Validate single store per order
  const storeIds = new Set(
    variants.map((v: (typeof variants)[number]) => v.product.storeId)
  );
  if (storeIds.size !== 1) {
    throw new Error("All items in an order must belong to the same store");
  }
  const storeId = variants[0].product.storeId;

  // Build items with server-side price and stock checks
  const variantById = new Map<string, VariantWithProduct>(
    variants.map((v) => [v.id, v] as const)
  );
  let pricePaid = 0;
  const orderItemsData = items.map((it: (typeof items)[number]) => {
    const v = variantById.get(it.productVariantId)!;
    const qty = Math.max(1, Math.floor(Number(it.quantity)) || 1);
    pricePaid += v.price * qty;
    return {
      productVariantId: v.id,
      quantity: qty,
      price: v.price,
    };
  });

  // Upsert buyer
  await prismadb.buyer.upsert({
    where: { id: userId },
    update: { name, email },
    create: { id: userId, name, email },
  });

  // Upsert address (save first, update later purchases)
  const existingAddr = await prismadb.address.findFirst({
    where: { buyerId: userId },
  });
  if (existingAddr) {
    await prismadb.address.update({
      where: { id: existingAddr.id },
      data: {
        street: shippingStreet,
        city: shippingCity,
        state: shippingState,
        postalCode: shippingPostalCode,
        country: shippingCountry,
      },
    });
  } else {
    await prismadb.address.create({
      data: {
        buyerId: userId,
        street: shippingStreet,
        city: shippingCity,
        state: shippingState,
        postalCode: shippingPostalCode,
        country: shippingCountry,
      },
    });
  }

  // Create order and decrement stock in a transaction
  const order = await prismadb.$transaction(async (tx) => {
    // Optionally validate stock
    for (const it of orderItemsData) {
      const v = await tx.productVariant.findUnique({
        where: { id: it.productVariantId },
      });
      if (!v) throw new Error("Variant not found during checkout");
      if (v.stock < it.quantity)
        throw new Error("Insufficient stock for an item");
    }

    // Create order
    const created = await tx.order.create({
      data: {
        buyerId: userId,
        storeId,
        pricePaid,
        platformFee: 0,
        shippingStreet: shippingStreet,
        shippingCity: shippingCity,
        shippingPostalCode: shippingPostalCode,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: { orderItems: true },
    });

    // Decrement stock
    for (const it of orderItemsData) {
      await tx.productVariant.update({
        where: { id: it.productVariantId },
        data: { stock: { decrement: it.quantity } },
      });
    }

    return created;
  });

  redirect(`/checkout/success?orderId=${order.id}`);
}
