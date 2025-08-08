import React from "react";
import prismadb from "@/lib/prismadb";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SalesChart } from "./sales-chart";
import type { Metadata, ResolvingMetadata } from "next";

const Dashboard = async ({ params }: { params: { storeid: string } }) => {
  // Fetch data
  const [products, orders, buyers] = await Promise.all([
    prismadb.product.findMany({ where: { storeId: params.storeid } }),
    prismadb.order.findMany({
      where: { storeId: params.storeid },
      orderBy: { createdAt: "desc" },
      include: {
        buyer: true,
        orderItems: {
          include: {
            productVariant: {
              include: { product: true },
            },
          },
        },
      },
    }),
    prismadb.buyer.findMany(),
  ]);

  // Aggregate data
  const totalSales = orders.reduce(
    (sum: number, order: any) => sum + order.pricePaid,
    0
  );
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalCustomers = buyers.length;

  // Sales by day for chart
  const salesByDay: { date: string; sales: number }[] = [];
  orders.forEach((order: any) => {
    const date = order.createdAt.toISOString().split("T")[0];
    const existing = salesByDay.find((d) => d.date === date);
    if (existing) existing.sales += order.pricePaid;
    else salesByDay.push({ date, sales: order.pricePaid });
  });
  salesByDay.sort((a, b) => a.date.localeCompare(b.date));

  // Recent orders (limit 5)
  const recentOrders: typeof orders = orders.slice(0, 5);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Sales</CardTitle>
            <CardDescription>All-time revenue</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            ${totalSales.toLocaleString()}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
            <CardDescription>All-time orders</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {totalOrders}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Products</CardTitle>
            <CardDescription>Products in store</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {totalProducts}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Customers</CardTitle>
            <CardDescription>Registered buyers</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {totalCustomers}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>Revenue by day</CardDescription>
        </CardHeader>
        <CardContent>
          {salesByDay.length > 0 ? (
            <SalesChart data={salesByDay} />
          ) : (
            <div className="text-center text-muted-foreground">
              No sales data available.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      {order.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {order.buyer?.name || order.buyer?.email || "-"}
                    </TableCell>
                    <TableCell>
                      {order.orderItems && order.orderItems.length > 0
                        ? order.orderItems
                            .map(
                              (item: any) =>
                                item.productVariant?.product?.name || "-"
                            )
                            .join(", ")
                        : "-"}
                    </TableCell>
                    <TableCell>${order.pricePaid.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground">
              No recent orders found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export async function generateMetadata(
  { params }: { params: { storeid: string } },
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const store = await prismadb.store.findUnique({
    where: { id: params.storeid },
  });
  const name = store?.name || "Store";
  const title = `${name} — Dashboard | SwiftCart`;
  const description = `Overview of sales, orders, and performance for ${name} on SwiftCart.`;
  return {
    title,
    description,
    robots: { index: false },
    openGraph: { title, description },
    twitter: { title, description, card: "summary" },
  };
}

export default Dashboard;
