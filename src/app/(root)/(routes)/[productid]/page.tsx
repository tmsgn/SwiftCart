import prismadb from "@/lib/prismadb";
import { notFound } from "next/navigation";
import { ProductDetails } from "./ProductDetails";
import type { Metadata, ResolvingMetadata } from "next";

const ProductPage = async (props: {
  params: Promise<{ productid: string }>;
}) => {
  const { productid } = await props.params;
  const product = await prismadb.product.findUnique({
    where: {
      id: productid,
    },
    include: {
      images: true,
      variants: {
        include: {
          variantValues: {
            include: {
              variant: true,
            },
          },
        },
      },
      reviews: { include: { buyer: true } },
      category: true,
    },
  });

  if (!product) {
    return notFound();
  }

  return <ProductDetails product={product} />;
};

export async function generateMetadata(
  { params }: { params: Promise<{ productid: string }> },
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { productid } = await params;
  const product = await prismadb.product.findUnique({
    where: { id: productid },
    include: { images: true, category: true },
  });

  if (!product) {
    return {
      title: "Product not found — SwiftCart",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${product.name} — Buy Online | SwiftCart`;
  const description =
    product.description?.slice(0, 160) ||
    `Shop ${product.name} at SwiftCart${
      product.category ? ` in ${product.category.name}` : ""
    }.`;

  const images = product.images?.length
    ? product.images.map((img) => ({ url: img.url }))
    : [{ url: "/og-default.png" }];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((i) => i.url as string),
    },
  };
}

export default ProductPage;
