"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { createStoreAction } from "@/app/_actions/store";

export function StoreModal({
  isOpen,
  onClose,
  initialData = { name: "" },
}: {
  isOpen: boolean;
  onClose: () => void;
  initialData?: { name: string };
}) {
  const [storeData, setStoreData] = useState({
    name: initialData?.name || "",
  });
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setStoreData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (storeData.name === (initialData?.name || "")) {
      toast.info("No changes detected.");
      return false;
    }
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("name", storeData.name);
      await createStoreAction(fd);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.log("Failed to create store:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Store</DialogTitle>
            <DialogDescription>
              Create store and sell your products
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={storeData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Store"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
