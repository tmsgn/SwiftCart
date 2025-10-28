"use client";
import React, { useState, useMemo } from "react";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui setup
import { cn } from "@/lib/utils"; // Assuming shadcn/ui setup
import Image from "next/image";
import Link from "next/link";

// --- TYPES (Unchanged) ---
type Image = {
  id: string;
  url: string;
};

type ProductVariant = {
  id: string;
  price: number;
  stock: number;
};

type Review = {
  id: string;
  rating: number;
};

type Product = {
  id: string;
  name: string;
  description: string;
  images: Image[];
  variants: ProductVariant[];
  reviews: Review[];
};

// --- STAR RATING HELPER (Unchanged) ---
const StarRating = ({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount: number;
}) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  if (reviewCount === 0) {
    return <div className="text-sm text-gray-400">No reviews yet</div>;
  }

  return (
    <div className="flex items-center space-x-1">
      <span className="text-sm text-gray-600 font-medium">
        {rating.toFixed(1)}
      </span>
      <div className="flex">
        {[...Array(fullStars)].map((_: unknown, i: number) => (
          <Star
            key={`full-${i}`}
            size={16}
            className="text-orange-400 fill-orange-400"
          />
        ))}
        {/* Removed half-star logic for cleaner look like in image */}
        {[...Array(emptyStars)].map((_: unknown, i: number) => (
          <Star
            key={`empty-${i}`}
            size={16}
            className="text-gray-300 fill-gray-300"
          />
        ))}
      </div>
    </div>
  );
};

// --- UPDATED PRODUCT CARD ---
export const ProductCard = ({ product }: { product: Product }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const { averageRating, reviewCount, displayPrice } = useMemo(() => {
    if (!product) {
      return {
        averageRating: 0,
        reviewCount: 0,
        displayPrice: new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(0),
      };
    }
    const totalReviews = product.reviews.length;
    const avg =
      totalReviews > 0
        ? product.reviews.reduce((acc, review) => acc + review.rating, 0) /
          totalReviews
        : 0;

    const price = (product as any).price ?? product.variants[0]?.price ?? 0;

    return {
      averageRating: avg,
      reviewCount: totalReviews,
      displayPrice: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price),
    };
  }, [product]);

  // FIX: Add a guard clause to handle cases where the product prop is not provided.
  // This prevents the "Cannot read properties of undefined" error.
  if (!product) {
    return null; // Or return a loading skeleton component
  }

  const primaryImage =
    product.images[0]?.url ||
    "https://placehold.co/400x400/f1f5f9/334155?text=No+Image";

  return (
    <div className="font-sans group">
      <div className="relative  dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-lg flex items-center justify-center p-4 aspect-square overflow-hidden">
        <Image
          src={primaryImage}
          alt={`Image of ${product.name}`}
          width={400}
          height={400}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src =
              "https://placehold.co/400x400/f1f5f9/334155?text=Error";
          }}
        />
        <Button
          variant="outline"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm"
          onClick={() => setIsFavorite(!isFavorite)}
          aria-label="Add to favorites"
        >
          <Heart
            size={18}
            className={cn(
              "transition-all",
              isFavorite
                ? "text-red-500 fill-red-500"
                : "text-gray-600 dark:text-gray-300"
            )}
          />
        </Button>
      </div>

      {/* Text content has no background or border */}
      <div className="pt-4">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 truncate">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
          {product.description}
        </p>
        <div className="mt-2">
          <StarRating rating={averageRating} reviewCount={reviewCount} />
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {displayPrice}
          </p>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-full text-sm"
          >
            <Link href={`${product.id}`}>Buy now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
