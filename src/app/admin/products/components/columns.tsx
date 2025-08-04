"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency, formatDate } from "@/lib/formatter";
import { Badge } from "@/components/ui/badge";
import { CellActions } from "./cell-actions";

export type Product = {
  id: string;
  name: string;
  status: "Available" | "Unavailable";
  stock: number;
  price: number;
  orders: number;
  createdAt: string;
};

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={status === "Available" ? "default" : "destructive"}>
          {status}
        </Badge>
      );
    },
  },

  {
    accessorKey: "stock",
    header: "Stock",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => formatCurrency(row.original.price),
  },
  {
    accessorKey: "orders",
    header: "Orders",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <CellActions productId={row.original.id} status={row.original.status} />
    ),
  },
];
