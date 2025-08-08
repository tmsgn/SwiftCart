"use server";

import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";

export async function getDefaultAddress() {
  const { userId } = await auth();
  if (!userId) return null;
  const addr = await prismadb.address.findFirst({ where: { buyerId: userId } });
  return addr;
}

export async function upsertAddressAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const street = String(formData.get("shippingStreet") || "").trim();
  const city = String(formData.get("shippingCity") || "").trim();
  const state = String(formData.get("shippingState") || "").trim();
  const postalCode = String(formData.get("shippingPostalCode") || "").trim();
  const country = String(formData.get("shippingCountry") || "").trim();

  if (!street || !city || !postalCode || !country)
    throw new Error("Missing address fields");

  const existing = await prismadb.address.findFirst({
    where: { buyerId: userId },
  });
  if (existing) {
    await prismadb.address.update({
      where: { id: existing.id },
      data: { street, city, state, postalCode, country },
    });
  } else {
    await prismadb.address.create({
      data: { buyerId: userId, street, city, state, postalCode, country },
    });
  }
}
