"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createReviewAction } from "@/app/_actions/reviews";

const formSchema = z.object({
  rating: z.number().min(1, "Please provide at least 1 star.").max(5),
  comment: z.string().max(500).optional(),
});

function Rating({
  value,
  onChange,
  max = 5,
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <div className="flex space-x-1">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < value;
        return (
          <Star
            key={i}
            onClick={() => onChange(i + 1)}
            className={cn(
              "h-6 w-6 cursor-pointer transition-colors",
              filled ? "text-yellow-500 fill-yellow-500" : "text-gray-400"
            )}
          />
        );
      })}
    </div>
  );
}

export default function RatingForm({
  productId,
  initialRating = 0,
}: {
  productId: string;
  initialRating?: number;
}) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { rating: initialRating, comment: "" },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("productId", productId);
        fd.set("rating", String(values.rating));
        fd.set("comment", values.comment || "");
        await createReviewAction(fd);
        toast.success("Thanks for your review!");
      } catch (e: any) {
        toast.error(e?.message || "Failed to submit review");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem className="flex flex-col items-start">
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <Rating value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormDescription>
                Share your experience with this product.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment (optional)</FormLabel>
              <FormControl>
                <textarea
                  className="w-full min-h-[96px] rounded-md border px-3 py-2"
                  placeholder="What did you like or dislike?"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Submitting..." : "Submit review"}
        </Button>
      </form>
    </Form>
  );
}
