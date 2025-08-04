"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  deleteProduct,
  toggleProductStatus,
} from "@/app/_actions/products-cell-actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PenSquare, PenSquareIcon, Trash2 } from "lucide-react";
import { AlertModal } from "@/components/alert-modal";
import Link from "next/link";

interface CellActionsProps {
  productId: string;
  status: "Available" | "Unavailable";
}

export const CellActions: React.FC<CellActionsProps> = ({
  productId,
  status,
}) => {
  const [isPending, startTransition] = useTransition();
  const [showAlert, setShowAlert] = useState(false);
  const router = useRouter();

  const handleDelete = () => {
    setShowAlert(true);
  };

  const confirmDelete = () => {
    setShowAlert(false);
    startTransition(async () => {
      const res = await deleteProduct(productId);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Product deleted.");
        router.refresh();
      }
    });
  };

  const handleToggleStatus = () => {
    startTransition(async () => {
      const res = await toggleProductStatus(productId);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(`Product status set to ${res.status}.`);
        router.refresh();
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isPending}>
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/products/${productId}`}>Update Product</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex justify-between"
            variant={status === "Available" ? "destructive" : "default"}
            onClick={handleToggleStatus}
            disabled={isPending}
          >
            {status === "Available" ? "Deactivate" : "Activate"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDelete}
            disabled={isPending}
            variant="destructive"
            className="flex justify-between"
          >
            Delete <Trash2 />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertModal
        open={showAlert}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        loading={isPending}
        onConfirm={confirmDelete}
        onCancel={() => setShowAlert(false)}
      />
    </>
  );
};
