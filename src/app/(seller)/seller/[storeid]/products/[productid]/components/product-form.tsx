"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Category,
  Image,
  Product,
  ProductVariant,
  Variant,
  VariantValue,
} from "../../../../../../../../generated/prisma";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { PlusCircle, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/image-uploader";
import { Separator } from "@/components/ui/separator";
import { createProduct, updateProduct } from "@/app/_actions/products";

const variantSchema = z.object({
  price: z.number().positive(),
  stock: z.number().int().min(0),
  sku: z.string().min(1, "SKU is required."),
  variantValueIds: z
    .array(z.string())
    .min(1, "Please select at least one variant option."),
});

const productFormSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  price: z.number().nonnegative(),
  images: z.array(z.object({ url: z.string() })).min(1),
  categoryId: z.string().min(1),
  isAvailable: z.boolean(),
  variants: z
    .array(variantSchema)
    .min(1, "Please add at least one product variant."),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData:
    | (Product & {
        images: Image[];
        variants: (ProductVariant & { variantValues: VariantValue[] })[];
      })
    | null;
  categories: (Category & { parent: Category | null; variants: Variant[] })[];
  variants: (Variant & { values: VariantValue[] })[];
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories,
  variants: allVariantOptions,
}) => {
  const params = useParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [filteredVariantOptions, setFilteredVariantOptions] = useState<
    (Variant & { values: VariantValue[] })[]
  >([]);
  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState<
    string | undefined
  >(
    initialData
      ? categories.find((c) => c.id === initialData.categoryId)?.parentId ||
          undefined
      : undefined
  );

  const title = initialData ? "Edit product" : "Create product";
  const description = initialData
    ? "Edit an existing product."
    : "Add a new product to your store.";
  const toastMessage = initialData ? "Product updated." : "Product created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description,
          price: Number(initialData.price ?? 0),
          images: initialData.images.map((img: Image) => ({ url: img.url })),
          categoryId: initialData.categoryId ?? "",
          isAvailable: initialData.isAvailable,
          variants: initialData.variants.map(
            (v: ProductVariant & { variantValues: VariantValue[] }) => ({
              price: Number(v.price),
              stock: Number(v.stock),
              sku: v.sku,
              variantValueIds: v.variantValues.map((vv: VariantValue) => vv.id),
            })
          ),
        }
      : {
          name: "",
          description: "",
          price: 0,
          images: [],
          categoryId: "",
          isAvailable: false,
          variants: [],
        },
  });

  const selectedSubCategoryId = form.watch("categoryId");

  useEffect(() => {
    if (selectedSubCategoryId) {
      const category = categories.find((c) => c.id === selectedSubCategoryId);
      if (category) {
        const categoryVariantNames = new Set(
          category.variants.map((v: Variant) => v.name)
        );
        setFilteredVariantOptions(
          allVariantOptions.filter((v) => categoryVariantNames.has(v.name))
        );
      }
    } else {
      setFilteredVariantOptions([]);
    }
  }, [selectedSubCategoryId, categories, allVariantOptions]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const onSubmit = (data: ProductFormValues) => {
    startTransition(async () => {
      try {
        if (initialData) {
          await updateProduct(params.productid as string, {
            ...data,
          });
        } else {
          await createProduct({ ...data, storeId: params.storeid as string });
        }
        router.refresh();
        router.push(`/seller/${params.storeid}/products`);
        toast.success(toastMessage);
      } catch {
        toast.error("Something went wrong.");
      }
    });
  };

  const parentCategories = categories.filter(
    (category: Category & { parent: Category | null; variants: Variant[] }) =>
      !category.parent
  );
  const subCategories = selectedParentCategoryId
    ? categories.filter(
        (
          category: Category & { parent: Category | null; variants: Variant[] }
        ) => category.parentId === selectedParentCategoryId
      )
    : [];

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      <Separator className="my-6" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Base Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          placeholder="e.g., 'Classic T-Shirt'"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={isPending}
                          value={
                            Number.isFinite(field.value as any)
                              ? field.value
                              : 0
                          }
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value || "0"))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Used when no variant is selected; variants can override
                        this.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel>Parent Category</FormLabel>
                  <Select
                    disabled={isPending}
                    onValueChange={(value) => {
                      setSelectedParentCategoryId(value);
                      form.setValue("categoryId", "");
                    }}
                    value={selectedParentCategoryId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {parentCategories.map((parent) => (
                        <SelectItem key={parent.id} value={parent.id}>
                          {parent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory</FormLabel>
                      <Select
                        disabled={isPending || !selectedParentCategoryId}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subcategory" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subCategories.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={isPending}
                        placeholder="A detailed description..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isAvailable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Availability</FormLabel>
                      <FormDescription>
                        Make this product visible in your store.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        disabled={isPending}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex gap-3 flex-wrap">
                        {Array.from({ length: 4 }).map(
                          (_: unknown, slotIndex: number) => {
                            const url = field.value[slotIndex]?.url;
                            return (
                              <ImageUpload
                                key={slotIndex}
                                value={url}
                                disabled={isPending}
                                onChange={(newUrl) => {
                                  const next = [...field.value];
                                  if (slotIndex < next.length) {
                                    next[slotIndex] = { url: newUrl };
                                  } else {
                                    next.push({ url: newUrl });
                                  }
                                  field.onChange(next);
                                }}
                                onRemove={(removeUrl) => {
                                  const next = [...field.value];
                                  if (
                                    slotIndex < next.length &&
                                    next[slotIndex]?.url === removeUrl
                                  ) {
                                    next.splice(slotIndex, 1);
                                  } else {
                                    const idx = next.findIndex(
                                      (i: { url: string }) =>
                                        i.url === removeUrl
                                    );
                                    if (idx !== -1) next.splice(idx, 1);
                                  }
                                  field.onChange(next);
                                }}
                              />
                            );
                          }
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Product Variants</CardTitle>
              <CardDescription>
                Add variants based on the selected subcategory.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {fields.map((field, index: number) => (
                <div
                  key={field.id}
                  className="p-4 border rounded-lg space-y-4 relative"
                >
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-3 -right-3 h-7 w-7"
                    onClick={() => remove(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`variants.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              disabled={isPending}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`variants.${index}.stock`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              disabled={isPending}
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  parseInt(e.target.value, 10) || 0
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`variants.${index}.sku`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU</FormLabel>
                          <FormControl>
                            <Input
                              disabled={isPending}
                              placeholder="e.g., TSHIRT-RED-S"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name={`variants.${index}.variantValueIds`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Options</FormLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {filteredVariantOptions.map(
                            (
                              optionType: Variant & { values: VariantValue[] }
                            ) => (
                              <Select
                                key={optionType.id}
                                onValueChange={(value) => {
                                  const otherValues = field.value.filter(
                                    (id) =>
                                      !optionType.values.some(
                                        (v) => v.id === id
                                      )
                                  );
                                  field.onChange([...otherValues, value]);
                                }}
                                value={
                                  field.value.find((id) =>
                                    optionType.values.some((v) => v.id === id)
                                  ) || ""
                                }
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue
                                      placeholder={`Select ${optionType.name}`}
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {optionType.values.map(
                                    (value: VariantValue) => (
                                      <SelectItem
                                        key={value.id}
                                        value={value.id}
                                      >
                                        {value.value}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            )
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!selectedSubCategoryId}
                onClick={() =>
                  append({
                    price: 0,
                    stock: 0,
                    sku: "",
                    variantValueIds: [],
                  })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Variant
              </Button>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button disabled={isPending} type="submit">
              {action}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};
