"use server";

import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function createStore({ name }: { name: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (!name) throw new Error("Missing store name");
  const store = await prismadb.store.create({
    data: {
      name,
      userId,
    },
  });
  return store;
}

export async function createStoreAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const store = await createStore({ name });
  redirect(`seller/${store.id}`);
}
