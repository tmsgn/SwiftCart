"use server";

import prismadb from "@/lib/prismadb";

export async function createProduct(data: {
  name: string;
  description: string;
  isAvailable: boolean;
  categoryId: string;
  storeId: string;
  images: { url: string }[];
  variants: {
    price: number;
    stock: number;
    sku: string;
    variantValueIds: string[];
  }[];
  status?: string;
}) {
  try {
    const product = await prismadb.product.create({
      data: {
        name: data.name,
        description: data.description,
        isAvailable: data.isAvailable,
        categoryId: data.categoryId,
        storeId: data.storeId,
        images: {
          create: data.images,
        },
        variants: {
          create: data.variants.map((variant) => ({
            price: variant.price,
            stock: variant.stock,
            sku: variant.sku,
            variantValues: {
              connect: variant.variantValueIds.map((id) => ({ id })),
            },
          })),
        },
      },
    });
    return product;
  } catch (error) {
    console.error("Product creation error:", error);
    throw error;
  }
}

export async function updateProduct(
  productId: string,
  data: {
    name?: string;
    description?: string;
    isAvailable?: boolean;
    categoryId?: string;
    images?: { url: string }[];
    variants?: {
      id?: string;
      price: number;
      stock: number;
      sku: string;
      variantValueIds: string[];
    }[];
  }
) {
  const product = await prismadb.product.findUnique({
    where: { id: productId },
    include: { images: true, variants: true },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const updatedProduct = await prismadb.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        description: data.description,
        isAvailable: data.isAvailable,
        categoryId: data.categoryId,
      },
    });

    if (data.images) {
      await tx.image.deleteMany({ where: { productId } });
      await tx.image.createMany({
        data: data.images.map((img) => ({ url: img.url, productId })),
      });
    }

    if (data.variants) {
      await tx.productVariant.deleteMany({ where: { productId } });
      await tx.productVariant.createMany({
        data: data.variants.map((variant) => ({
          price: variant.price,
          stock: variant.stock,
          sku: variant.sku,
          productId,
        })),
      });
    }
    return product;
  });

  return updatedProduct;
}
