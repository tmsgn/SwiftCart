"use server";

import prismadb from "@/lib/prismadb";

export async function createCategory(data: {
  name: string;
  parentId?: string;
}) {
  if (!data.name) throw new Error("Name is required");
  return prismadb.category.create({
    data: { name: data.name, parentId: data.parentId },
  });
}

export async function deleteCategory(id: string) {
  if (!id) throw new Error("Category id required");
  return prismadb.category.delete({ where: { id } });
}

export async function listCategories() {
  return prismadb.category.findMany({
    include: { parent: true, subCategories: true, variants: true },
  });
}
