"use server";

import prismadb from "@/lib/prismadb";
import type { Prisma } from "@prisma/client";

export async function createProduct(data: {
  name: string;
  description: string;
  price: number; // base product price
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
    const basePrice = Number(data.price);
    if (Number.isNaN(basePrice) || basePrice < 0) {
      throw new Error("Invalid base price");
    }

    const product = await prismadb.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: basePrice,
        isAvailable: data.isAvailable,
        categoryId: data.categoryId,
        storeId: data.storeId,
        images: {
          create: data.images,
        },
        variants: {
          create: data.variants.map(
            (variant: (typeof data.variants)[number]) => ({
              price: variant.price,
              stock: variant.stock,
              sku: variant.sku,
              variantValues: {
                connect: variant.variantValueIds.map((id: string) => ({ id })),
              },
            })
          ),
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
    price?: number; // base product price
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
  try {
    return await prismadb.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update only provided product fields
      await tx.product.update({
        where: { id: productId },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
          ...(data.price !== undefined && { price: Number(data.price) }),
          ...(data.isAvailable !== undefined && {
            isAvailable: data.isAvailable,
          }),
          ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        },
      });

      // Images: replace only if provided
      if (Array.isArray(data.images)) {
        await tx.image.deleteMany({ where: { productId } });
        if (data.images.length > 0) {
          await tx.image.createMany({
            data: data.images.map((img: { url: string }) => ({
              url: img.url,
              productId,
            })),
          });
        }
      }

      // Variants: upsert by id or SKU and keep referenced ones
      if (Array.isArray(data.variants)) {
        const existing = await tx.productVariant.findMany({
          where: { productId },
          include: {
            variantValues: { select: { id: true } },
            orderItems: { select: { id: true } },
          },
        });
        type ExistingVariant = (typeof existing)[number];

        const byId = new Map(
          existing.map((v: ExistingVariant) => [v.id, v] as const)
        );
        const bySku = new Map(
          existing.map((v: ExistingVariant) => [v.sku, v] as const)
        );
        const keptIds = new Set<string>();

        type IncomingVariant = {
          id?: string;
          price: number;
          stock: number;
          sku: string;
          variantValueIds: string[];
        };

        for (const v of data.variants as IncomingVariant[]) {
          const price = Number(v.price);
          const stock = Number(v.stock);
          if (Number.isNaN(price) || Number.isNaN(stock)) {
            throw new Error(`Invalid price/stock for SKU '${v.sku}'.`);
          }

          // Ensure SKU is unique across other products (ignore same record if matched by id or sku)
          const targetById = v.id
            ? await tx.productVariant.findUnique({ where: { id: v.id } })
            : null;
          const conflictingSku = await tx.productVariant.findFirst({
            where: {
              sku: v.sku,
              NOT: { id: targetById?.id ?? undefined },
              productId: { not: productId },
            },
            select: { id: true, productId: true },
          });
          if (conflictingSku) {
            throw new Error(
              `SKU '${v.sku}' is already used by another product.`
            );
          }

          // Validate all variantValueIds exist
          const vvIds: string[] = Array.isArray(v.variantValueIds)
            ? v.variantValueIds
            : [];
          if (vvIds.length) {
            const found = await tx.variantValue.findMany({
              where: { id: { in: vvIds } },
              select: { id: true },
            });
            if (found.length !== vvIds.length) {
              const foundIds = new Set(found.map((x: { id: string }) => x.id));
              const missing = vvIds.filter((id) => !foundIds.has(id));
              throw new Error(`Invalid variantValueIds: ${missing.join(", ")}`);
            }
          }

          const target: ExistingVariant | undefined =
            (v.id ? byId.get(v.id) : undefined) ?? bySku.get(v.sku);
          if (target) {
            await tx.productVariant.update({
              where: { id: target.id },
              data: {
                price,
                stock,
                sku: v.sku,
                variantValues: {
                  set: vvIds.map((id: string) => ({ id })),
                },
              },
            });
            keptIds.add(target.id);
          } else {
            const created = await tx.productVariant.create({
              data: {
                productId,
                price,
                stock,
                sku: v.sku,
                variantValues: {
                  connect: vvIds.map((id: string) => ({ id })),
                },
              },
            });
            keptIds.add(created.id);
          }
        }

        // Delete removed variants only if they have no order references and not kept
        for (const ev of existing) {
          if (!keptIds.has(ev.id)) {
            const hasRefs = ev.orderItems.length > 0;
            if (!hasRefs) {
              await tx.productVariant.delete({ where: { id: ev.id } });
            }
          }
        }
      }

      // Return fresh product with relations
      return tx.product.findUnique({
        where: { id: productId },
        include: {
          images: true,
          variants: { include: { variantValues: true } },
        },
      });
    });
  } catch (error: any) {
    console.error(
      "Product update error:",
      error?.code || error?.name,
      error?.message,
      error?.meta || error
    );
    throw error;
  }
}
