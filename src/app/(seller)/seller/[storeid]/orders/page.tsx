import { DataTable } from "@/components/data-table";
import { columns, type OrderRow } from "./components/columns";
import prismadb from "@/lib/prismadb";
import { PageHeader } from "@/components/page-header";
import type { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ storeid: string }> },
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { storeid } = await params;
  const store = await prismadb.store.findUnique({
    where: { id: storeid },
  });
  const name = store?.name || "Store";
  const title = `${name} — Orders | SwiftCart`;
  const description = `View and manage orders for ${name}.`;
  return { title, description, robots: { index: false } };
}

export default async function OrdersPage(props: {
  params: Promise<{ storeid: string }>;
}) {
  const { storeid } = await props.params;
  const orders = await prismadb.order.findMany({
    where: { storeId: storeid },
    include: {
      buyer: true,
      orderItems: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const rows: OrderRow[] = orders.map((o) => ({
    id: o.id,
    createdAt: o.createdAt.toISOString(),
    buyerName: o.buyer?.name || "Unknown",
    buyerEmail: o.buyer?.email || "",
    total: o.pricePaid,
    items: o.orderItems.reduce((s, it) => s + it.quantity, 0),
    status: o.status,
  }));

  return (
    <div className="container mx-auto">
      <div className="mb-4">
        <PageHeader
          title="Orders"
          description="View and manage your store orders."
        />
      </div>
      <DataTable columns={columns} data={rows} />
    </div>
  );
}
