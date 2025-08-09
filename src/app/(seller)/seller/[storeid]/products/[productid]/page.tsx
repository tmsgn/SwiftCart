import React from "react";
import { ProductForm } from "./components/product-form";
import prismadb from "@/lib/prismadb";
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";

const ProductPage = async (props: {
  params: Promise<{ productid: string; storeid: string }>;
}) => {
  const { productid, storeid } = await props.params;
  let initialData = null;
  if (productid !== "create") {
    initialData = await prismadb.product.findUnique({
      where: { id: productid, storeId: storeid },
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

export async function generateMetadata(
  { params }: { params: Promise<{ storeid: string; productid: string }> },
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { productid, storeid } = await params;
  const isCreate = productid === "create";
  if (isCreate) {
    return {
      title: "Create Product — SwiftCart",
      description: "Add a new product to your SwiftCart store.",
      robots: { index: false },
    };
  }
  const product = await prismadb.product.findUnique({
    where: { id: productid, storeId: storeid },
    select: { name: true },
  });
  const name = product?.name || "Product";
  const title = `${name} — Edit Product | SwiftCart`;
  return {
    title,
    description: `Edit details for ${name}.`,
    robots: { index: false },
  };
}

export default ProductPage;
