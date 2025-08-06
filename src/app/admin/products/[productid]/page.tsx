import React from "react";
import { ProductForm } from "./components/product-form";
import prismadb from "@/lib/prismadb";
import { notFound } from "next/navigation";

const ProductPage = async ({ params }: { params: { productid: string } }) => {
  let initialData = null;
  if (params.productid !== "create") {
    initialData = await prismadb.product.findUnique({
      where: { id: params.productid },
      include: {
        images: true,
        variants: {
          include: {
            variantValues: true,
          },
        },
      },
    });
    if (!initialData) {
      notFound();
    }
  }

  const categories = await prismadb.category.findMany({
    include: {
      parent: true,
      variants: true,
    },
  });
  const variants = await prismadb.variant.findMany({
    include: {
      values: true,
    },
  });

  return (
    <ProductForm
      initialData={initialData}
      categories={categories}
      variants={variants}
    />
  );
};

export default ProductPage;
