"use server";

import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";

export async function createReviewAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const productId = String(formData.get("productId") || "").trim();
  const ratingNum = Number(formData.get("rating"));
  const comment = String(formData.get("comment") || "").trim();

  if (!productId) throw new Error("Missing productId");
  if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5)
    throw new Error("Invalid rating");

  // Ensure the user purchased this product
  const purchased = await prismadb.order.findFirst({
    where: {
      buyerId: userId,
      orderItems: {
        some: {
          productVariant: { productId },
        },
      },
    },
    select: { id: true },
  });
  if (!purchased) throw new Error("You can only review products you purchased");

  const existing = await prismadb.review.findFirst({
    where: { buyerId: userId, productId },
    select: { id: true },
  });

  if (existing) {
    await prismadb.review.update({
      where: { id: existing.id },
      data: { rating: Math.round(ratingNum), comment: comment || null },
    });
  } else {
    await prismadb.review.create({
      data: {
        buyerId: userId,
        productId,
        rating: Math.round(ratingNum),
        comment: comment || null,
      },
    });
  }
}
