import prismadb from "@/lib/prismadb";
import ProductCard from "./components/product-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SwiftCart — Home",
  description: "Discover the latest products and best deals on SwiftCart.",
};

const RootPage = async () => {
  const products = await prismadb.product.findMany({
    where: { isAvailable: true },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      images: true,
      variants: true,
      reviews: true,
    },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 p-8">
      {products.map((product: (typeof products)[number]) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default RootPage;
