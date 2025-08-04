import { ProductCard } from "@/components/product-card";
import prismadb from "@/lib/prismadb";
import React from "react";

const Home = async () => {
  const products = await prismadb.product.findMany({
    where: { status: "Available" },
    include: {
      images: true,
    },
  });
  return (
    <div className="grid grid-cols-5 gap-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          price={product.price}
          description={product.description || ""}
          imagePath={product.images[0]?.url }
        />
      ))}
    </div>
  );
};

export default Home;
