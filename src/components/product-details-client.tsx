"use client";
import React, { useState } from "react";
import Image from "next/image";
import { formatCurrency } from "@/lib/formatter";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export function ProductDetailsClient({
  product,
  imagePath,
}: {
  product: any;
  imagePath: string;
}) {
  // Get all option names
  const options: string[] =
    product.variants?.[0]?.optionValues?.map(
      (ov: any) => ov.optionValue?.Option?.name
    ) || [];

  // Get all possible values for each option
  const allOptionValues: Record<string, string[]> = {};
  options.forEach((opt: string) => {
    allOptionValues[opt] = Array.from(
      new Set(
        product.variants
          ?.map((variant: any) => {
            const ov = variant.optionValues?.find(
              (v: any) => v.optionValue?.Option?.name === opt
            );
            return ov?.optionValue?.value;
          })
          .filter(Boolean)
      )
    );
  });

  // State for selected values (all empty initially)
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    options.forEach((opt: string) => {
      initial[opt] = "";
    });
    return initial;
  });

  // When a user selects a value, update that option and reset others if needed
  function handleSelect(opt: string, val: string) {
    setSelected((prev) => ({ ...prev, [opt]: val }));
  }

  // Find the matching variant
  const selectedVariant = product.variants?.find((variant: any) => {
    return options.every((opt: string) => {
      if (!selected[opt]) return true;
      const ov = variant.optionValues?.find(
        (v: any) => v.optionValue?.Option?.name === opt
      );
      return ov?.optionValue?.value === selected[opt];
    });
  });

  // No longer disable any option in dropdowns
  // Only disable Buy Now if the combination is invalid

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* Product Image */}
      <div className="flex flex-col items-center justify-center">
        <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={imagePath}
            alt={product.name}
            fill
            className="object-contain"
          />
        </div>
      </div>
      {/* Product Details */}
      <div className="flex flex-col justify-between h-full">
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <div className="text-2xl text-primary font-semibold mb-4">
            {selectedVariant
              ? formatCurrency(selectedVariant.price)
              : formatCurrency(product.price)}
          </div>
          <p className="text-base text-muted-foreground mb-6 whitespace-pre-line">
            {product.description}
          </p>

          {/* Variant Selectors as shadcn dropdowns */}
          {options.length > 0 && (
            <div className="space-y-4 mb-6">
              {options.map((opt: string) => (
                <div key={opt} className="flex items-center gap-3">
                  <span className="font-medium text-sm min-w-[80px]">
                    {opt}:
                  </span>
                  <Select
                    value={selected[opt]}
                    onValueChange={(val) => handleSelect(opt, val)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={`Select ${opt}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {allOptionValues[opt].map((val: string) => (
                        <SelectItem key={val} value={val}>
                          {val}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}

          {/* Selected Variant Info */}
          {selectedVariant && (
            <div className="mb-4">
              <div className="text-sm text-muted-foreground">
                Stock: {selectedVariant.stock}
              </div>
            </div>
          )}
          {!selectedVariant && (
            <div className="mb-4">
              <div className="text-sm text-destructive">
                This combination is not available.
              </div>
            </div>
          )}
        </div>
        <div className="mt-8">
          <Button
            asChild
            size="lg"
            className="w-full text-lg py-4"
            disabled={!selectedVariant || selectedVariant.stock < 1}
          >
            <Link href={selectedVariant ? `${product.id}/purchase` : "#"}>
              {selectedVariant && selectedVariant.stock > 0
                ? "Buy Now"
                : "Out of Stock"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
