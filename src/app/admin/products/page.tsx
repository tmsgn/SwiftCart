import React from "react";
import { DataTable } from "@/components/data-table";
import { columns } from "./components/columns";
import prismadb from "@/lib/prismadb";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Products = async () => {
  const products = await prismadb.product.findMany({
    include: {
      variants: true,
      orders: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    status: product.status,
    price: product.price,
    stock: product.variants.reduce((sum, variant) => sum + variant.stock, 0),
    orders: product.orders.length,
    createdAt: product.createdAt.toISOString(),
  }));

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-4">
        <PageHeader
          title="Products"
          description="Manage your products and their variants."
        />
        <Button asChild>
          <Link href="/admin/products/create">Create Product</Link>
        </Button>
      </div>
      <DataTable columns={columns} data={formattedProducts} />
    </div>
  );
};

export default Products;
