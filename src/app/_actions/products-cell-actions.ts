"use server";
import prismadb from "@/lib/prismadb";

export async function deleteProduct(productId: string) {
  try {
    await prismadb.product.delete({ where: { id: productId } });
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete product." };
  }
}

export async function toggleProductStatus(productId: string) {
  try {
    const product = await prismadb.product.findUnique({
      where: { id: productId },
      select: { isAvailable: true },
    });
    if (!product) {
      return { error: "Product not found." };
    }

    const updated = await prismadb.product.update({
      where: { id: productId },
      data: { isAvailable: !product.isAvailable },
    });
    return { success: true, isAvailable: updated.isAvailable };
  } catch (error: any) {
    return { error: error.message || "Failed to toggle product status." };
  }
}
