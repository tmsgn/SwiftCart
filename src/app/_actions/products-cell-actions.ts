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
    });
    if (!product) return { error: "Product not found." };
    const newStatus =
      product.status === "Available" ? "Unavailable" : "Available";
    await prismadb.product.update({
      where: { id: productId },
      data: { status: newStatus },
    });
    return { success: true, status: newStatus };
  } catch (error: any) {
    return { error: error.message || "Failed to toggle status." };
  }
}
