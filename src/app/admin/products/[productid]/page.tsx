import React from "react";
import { ProductForm } from "./components/product-form";
import prismadb from "@/lib/prismadb";
import { notFound } from "next/navigation";

const ProductPage = async ({ params }: { params: { productid: string } }) => {
  const [categories, brands, subcategories, options, optionValues, product] =
    await Promise.all([
      prismadb.category.findMany(),
      prismadb.brand.findMany({
        include: { categories: { select: { id: true } } },
      }),
      prismadb.subcategory.findMany(),
      prismadb.option.findMany(),
      prismadb.optionValue.findMany(),
      prismadb.product.findUnique({
        where: { id: params.productid },
        include: {
          images: true,
          variants: {
            include: {
              optionValues: {
                include: {
                  optionValue: {
                    include: { Option: true },
                  },
                },
              },
            },
          },
          options: true,
          Subcategory: true,
        },
      }),
    ]);

    if (!product && params.productid !== "create") return notFound();

  // Map product to form initialValues
  const mappedProduct =
    product && typeof product === "object"
      ? {
          id: product.id, // <-- Ensure id is included
          name: product.name,
          description: product.description ?? "",
          price: product.price,
          images: Array.isArray((product as any).images)
            ? (product as any).images.map((img: any) => ({ url: img.url }))
            : [],
          categoryId: (product as any).Subcategory?.categoryId || "",
          subcategoryId: product.subcategoryId || "",
          brandId: product.brandId || "",
          isFeatured: product.isFeatured,
          status: product.status,
          options: Array.isArray((product as any).options)
            ? (product as any).options.map((opt: any) => opt.optionId)
            : [],
          discountType: product.discountType ?? null,
          discountValue: product.discountValue ?? null,
          variants: Array.isArray((product as any).variants)
            ? (product as any).variants.map((variant: any) => {
                const optionValues: Record<string, string> = {};
                if (Array.isArray(variant.optionValues)) {
                  for (const vo of variant.optionValues) {
                    if (vo.optionValue && vo.optionValue.Option) {
                      optionValues[vo.optionValue.Option.name] =
                        vo.optionValue.value;
                    }
                  }
                }
                return {
                  price: variant.price,
                  stock: variant.stock,
                  ...optionValues,
                };
              })
            : [],
        }
      : undefined;

  return (
    <ProductForm
      catalog={{ categories, brands, subcategories, options, optionValues }}
      initialValues={mappedProduct}
    />
  );
};

export default ProductPage;
