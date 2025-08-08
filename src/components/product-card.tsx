import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import Image from "next/image";
import { formatCurrency } from "@/lib/formatter";
import { Button } from "./ui/button";
import Link from "next/link";
type ProductCardProps = {
  id: string;
  name: string;
  price: number;
  description: string;
  imagePath: string;
};
export const ProductCard = ({
  id,
  name,
  price,
  description,
  imagePath,
}: ProductCardProps) => {
  let validImagePath = imagePath;
  if (
    validImagePath &&
    !validImagePath.startsWith("http") &&
    !validImagePath.startsWith("/")
  ) {
    validImagePath = "/" + validImagePath;
  }
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative w-full h-auto aspect-video">
        <Image src={validImagePath} fill alt={name} />
      </div>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{formatCurrency(price)}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="line-clamp-4">{description}</p>
      </CardContent>
      <CardFooter>
        <Button asChild size="lg" className="w-full">
          <Link href={`/${id}`}>Buy</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
