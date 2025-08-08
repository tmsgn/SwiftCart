// Make sure to place this file in your components folder, e.g., app/products/[productid]/ProductDetails.tsx

"use client";

import { useState, useMemo, useEffect } from "react";
import { Prisma } from "../../../../../generated/prisma";
import { Star } from "lucide-react";
import Image from "next/image";
import { MessageSquareText } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useCart } from "@/hooks/use-cart";
import { useRouter } from "next/navigation";

// Define the type for the product prop, including all the relations fetched in the Page component.
type ProductWithDetails = Prisma.ProductGetPayload<{
  include: {
    images: true;
    variants: {
      include: {
        variantValues: {
          include: {
            variant: true;
          };
        };
      };
    };
    reviews: { include: { buyer: true } };
    category: true;
  };
}>;

interface ProductDetailsProps {
  product: ProductWithDetails;
}

export const ProductDetails = ({ product }: ProductDetailsProps) => {
  // State for the main image displayed
  const [mainImage, setMainImage] = useState(
    product.images[0]?.url || "/placeholder.svg"
  );

  const router = useRouter();
  const { add, loading } = useCart();

  // State to track the currently selected options for each variant type
  // e.g., { "Color": "Blue", "Size": "M" }
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});

  // Memoize the calculation of organized variants to prevent re-computation on every render.
  // This transforms the flat variant list into a structured map.
  // e.g., { "Color": ["Red", "Blue"], "Size": ["S", "M", "L"] }
  const organizedVariants = useMemo(() => {
    const variantsMap: Record<string, Set<string>> = {};
    product.variants.forEach((productVariant) => {
      productVariant.variantValues.forEach((variantValue) => {
        const variantName = variantValue.variant.name;
        if (!variantsMap[variantName]) {
          variantsMap[variantName] = new Set();
        }
        variantsMap[variantName].add(variantValue.value);
      });
    });
    // Convert Sets to Arrays
    const result: Record<string, string[]> = {};
    for (const key in variantsMap) {
      result[key] = Array.from(variantsMap[key]);
    }
    return result;
  }, [product.variants]);

  // Effect to set the initial default selected variants when the component mounts
  useEffect(() => {
    const initialSelections: Record<string, string> = {};
    for (const variantName in organizedVariants) {
      // Select the first available option as the default
      initialSelections[variantName] = organizedVariants[variantName][0];
    }
    setSelectedVariants(initialSelections);
  }, [organizedVariants]);

  // Find the current product variant object based on the user's selections
  const currentVariant = useMemo(() => {
    // Return null if not all variant types have been selected
    if (
      Object.keys(selectedVariants).length !==
      Object.keys(organizedVariants).length
    ) {
      return null;
    }

    return product.variants.find((productVariant) => {
      return productVariant.variantValues.every((variantValue) => {
        const variantName = variantValue.variant.name;
        const selectedValue = selectedVariants[variantName];
        return selectedValue === variantValue.value;
      });
    });
  }, [selectedVariants, product.variants, organizedVariants]);

  // Calculate average rating
  const averageRating = useMemo(() => {
    if (!product.reviews || product.reviews.length === 0) {
      return 0;
    }
    const total = product.reviews.reduce(
      (acc, review) => acc + review.rating,
      0
    );
    return total / product.reviews.length;
  }, [product.reviews]);

  const handleVariantChange = (variantName: string, value: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantName]: value,
    }));
  };

  const isOutOfStock = !currentVariant || currentVariant.stock === 0;

  const handleAddToCart = async () => {
    if (!currentVariant) return;
    await add({
      productVariantId: currentVariant.id,
      quantity: 1,
      price: currentVariant.price,
      productName: product.name,
      imageUrl: product.images[0]?.url,
      attributes: Object.fromEntries(
        currentVariant.variantValues.map((vv) => [vv.variant.name, vv.value])
      ),
    });
  };

  const handleBuyNow = async () => {
    if (!currentVariant) return;
    await add({
      productVariantId: currentVariant.id,
      quantity: 1,
      price: currentVariant.price,
      productName: product.name,
      imageUrl: product.images[0]?.url,
      attributes: Object.fromEntries(
        currentVariant.variantValues.map((vv) => [vv.variant.name, vv.value])
      ),
    });
    router.push("/cart");
  };

  return (
    <div className="container mx-auto px-4 py-8 lg:py-10">
      <div className="flex flex-col md:flex-row gap-6 lg:gap-10">
        {/* Image Gallery */}
        <div className="flex flex-col gap-4 w-full md:w-[360px] lg:w-[400px] mx-auto md:mx-0">
          <div className="rounded-2xl border  shadow-sm overflow-hidden">
            <AspectRatio ratio={1 / 1}>
              <div className="relative w-full h-full">
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-[1.02]"
                  priority
                />
              </div>
            </AspectRatio>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-4 gap-3">
            {product.images.map((image) => (
              <button
                key={image.id}
                onClick={() => setMainImage(image.url)}
                className={cn(
                  "relative h-16 border rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  mainImage === image.url && "ring-2 ring-primary ring-offset-2"
                )}
                aria-label="Select product image thumbnail"
              >
                <Image
                  src={image.url}
                  alt={`${product.name} thumbnail`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Information */}
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight leading-tight">
            {product.name}
          </h1>

          {/* Ratings */}
          {product.reviews.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-4 h-4",
                      i < Math.round(averageRating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-muted-foreground">
                {averageRating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <div className="text-3xl lg:text-4xl font-semibold tracking-tight">
              {currentVariant
                ? `$${currentVariant.price.toFixed(2)}`
                : `$${product.price.toFixed(2)}`}
            </div>
          </div>

          <Separator />

          <p className="text-muted-foreground text-[15px] leading-7">
            {product.description}
          </p>

          {/* Quick Specs */}

          {/* Variant Selectors */}
          <div className="flex flex-col gap-6">
            {Object.entries(organizedVariants).map(([variantName, values]) => (
              <div key={variantName} className="flex flex-col gap-3">
                <Label className="text-base font-medium">
                  {variantName}:{" "}
                  <span className="text-muted-foreground">
                    {selectedVariants[variantName]}
                  </span>
                </Label>
                <RadioGroup
                  value={selectedVariants[variantName]}
                  onValueChange={(value) =>
                    handleVariantChange(variantName, value)
                  }
                  className="flex flex-wrap gap-2"
                >
                  {values.map((value) => (
                    <div key={value}>
                      <RadioGroupItem
                        value={value}
                        id={`${variantName}-${value}`}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={`${variantName}-${value}`}
                        className={cn(
                          "px-3.5 py-1.5 text-sm border rounded-full cursor-pointer transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          selectedVariants[variantName] === value &&
                            "bg-primary text-primary-foreground border-primary"
                        )}
                      >
                        {value}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-2 flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1"
              disabled={isOutOfStock || loading}
              onClick={handleAddToCart}
            >
              {isOutOfStock
                ? "Out of Stock"
                : loading
                  ? "Adding..."
                  : "Add to Cart"}
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-transparent"
              disabled={isOutOfStock || loading}
              onClick={handleBuyNow}
            >
              Buy now
            </Button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquareText className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Customer Reviews</h2>
          <span className="text-sm text-muted-foreground">
            ({product.reviews.length})
          </span>
        </div>

        {product.reviews.length === 0 ? (
          <p className="text-muted-foreground">No reviews yet.</p>
        ) : (
          <div className="space-y-6">
            {product.reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>
                        {review.buyer?.name?.slice(0, 1)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {review.buyer?.name ||
                          review.buyer?.email ||
                          "Anonymous"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(
                          review.createdAt as unknown as string | number | Date
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-4 h-4",
                          i < review.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
