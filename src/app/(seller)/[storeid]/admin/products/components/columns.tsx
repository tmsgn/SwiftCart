"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency, formatDate } from "@/lib/formatter";
import { Badge } from "@/components/ui/badge";
import { CellActions } from "./cell-actions";

export type Product = {
  id: string;
  storeId: string;
  name: string;
  isAvailable: boolean
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
      const isAvailable = row.original.isAvailable;
      return (
        <Badge variant={isAvailable ? "default" : "destructive"}>
         {isAvailable ? "Available" : "Unavailable"}
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
      <CellActions storeId={row.original.storeId} productId={row.original.id} isAvailable={row.original.isAvailable} />
    ),
  },
];
