import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency, formatDate } from "@/lib/formatter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import RatingForm from "@/components/reviews/rating-form";

export const metadata = {
  title: "My Orders",
};

export default async function MyOrdersPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>My Orders</CardTitle>
            <CardDescription>
              You need to sign in to view your orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link className="text-primary underline" href="/sign-in">
              Go to sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const orders = await prismadb.order.findMany({
    where: { buyerId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      store: true,
      orderItems: {
        include: {
          productVariant: {
            include: {
              product: {
                include: {
                  images: true,
                  reviews: {
                    where: { buyerId: userId },
                    select: { id: true, rating: true, comment: true },
                  },
                },
              },
              variantValues: { include: { variant: true } },
            },
          },
        },
      },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="sticky top-0 z-10 -mx-4 border-b bg-background/80 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-semibold">My Orders</h1>
          <p className="text-muted-foreground">
            Track your purchases and leave reviews for products you&apos;ve
            tried.
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No orders yet</CardTitle>
            <CardDescription>
              When you place orders, they will show up here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/" className="text-primary underline">
              Browse products
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order: (typeof orders)[number]) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>Placed {formatDate(order.createdAt)}</span>
                    <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs uppercase tracking-wide">
                      {order.status}
                    </span>
                    {order.store ? (
                      <span>
                        Store:{" "}
                        <span className="font-medium text-foreground">
                          {order.store.name}
                        </span>
                      </span>
                    ) : null}
                  </CardDescription>
                </div>
                <div className="text-sm sm:text-base text-foreground font-semibold">
                  {formatCurrency(order.pricePaid)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50%] min-w-64">Item</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Variant
                        </TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="w-[320px]">Your review</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.orderItems.map((it) => {
                        const pv = it.productVariant;
                        const product = pv.product;
                        const imageUrl =
                          product.images?.[0]?.url ||
                          "/products/placeholder.svg";
                        const variantLabel = pv.variantValues
                          .map((vv) => `${vv.variant.name}: ${vv.value}`)
                          .join(", ");
                        const existingReview = product.reviews?.[0];
                        const initialRating = existingReview?.rating || 0;
                        const initialComment = existingReview?.comment || "";
                        return (
                          <TableRow key={it.id}>
                            <TableCell>
                              <div className="flex items-start gap-3">
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                                  <Image
                                    src={imageUrl}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <Link
                                    href={`/${product.id}`}
                                    className="line-clamp-1 font-medium hover:underline"
                                  >
                                    {product.name}
                                  </Link>
                                  <div className="text-xs text-muted-foreground">
                                    Product ID: {product.id}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="align-top hidden md:table-cell">
                              {variantLabel || "-"}
                            </TableCell>
                            <TableCell className="align-top text-center">
                              {it.quantity}
                            </TableCell>
                            <TableCell className="align-top text-right">
                              {formatCurrency(it.price)}
                            </TableCell>
                            <TableCell className="align-top">
                              <div className="space-y-2">
                                <RatingForm
                                  productId={product.id}
                                  initialRating={initialRating}
                                  initialComment={initialComment}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="grid gap-1 text-sm text-muted-foreground">
                  <div>
                    Shipping to: {order.shippingStreet}, {order.shippingCity}{" "}
                    {order.shippingPostalCode}
                  </div>
                  {order.paymentIntentId ? (
                    <div>Payment reference: {order.paymentIntentId}</div>
                  ) : null}
                  <div>Updated: {formatDate(order.updatedAt)}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
