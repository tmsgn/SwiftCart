"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { useMemo, useState, useTransition } from "react";
import { Terminal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Server action
import { createProduct, updateProduct } from "@/app/_actions/products";
// Shadcn UI Components
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/image-uploader";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- ZOD SCHEMA (sku removed) ---
const ProductStatus = z.enum(["Available", "Unavailable"]);
const DiscountTypeEnum = z.enum(["PERCENTAGE", "FIXED"]);

const formSchema = z.object({
  name: z.string().min(1, "Name is required."),
  description: z.string().min(1, "Description is required."),
  price: z.number().min(0.01, "Price is required."),
  images: z
    .array(z.object({ url: z.string().url() }))
    .min(1, "At least one image is required."),
  categoryId: z.string().min(1, "Category is required."),
  subcategoryId: z.string().min(1, "Subcategory is required."),
  brandId: z.string().min(1, "Brand is required."),
  isFeatured: z.boolean(),
  status: ProductStatus,
  options: z.array(z.string()),
  discountType: DiscountTypeEnum.optional().nullable(),
  discountValue: z.number().optional().nullable(),
  variants: z
    .array(
      z
        .object({
          price: z.number().min(0, "Variant price cannot be negative."),
          stock: z.number().min(0, "Variant stock cannot be negative."),
        })
        .catchall(z.string().or(z.number()).optional())
    )
    .min(1, "At least one product variant is required."),
});

// --- TYPE DEFINITIONS ---
type CatalogType = {
  categories: any[];
  brands: any[];
  subcategories: any[];
  options: any[];
  optionValues: any[];
};

interface ProductFormProps {
  catalog: CatalogType;
  initialValues?: Partial<z.infer<typeof formSchema>>;
}

type Variant = z.infer<typeof formSchema>["variants"][number];

// --- THE FORM COMPONENT ---
export const ProductForm: React.FC<ProductFormProps> = ({
  catalog,
  initialValues,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues ?? {
      name: "",
      description: "",
      price: 0,
      images: [],
      categoryId: "",
      subcategoryId: "",
      brandId: "",
      isFeatured: false,
      status: "Available",
      options: [],
      discountType: null,
      discountValue: null,
      variants: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });
  const { watch } = form;

  const selectedCategoryId = watch("categoryId");
  const selectedSubcategoryId = watch("subcategoryId");
  const selectedOptionIds = watch("options");

  const getSubcategories = () => {
    if (!selectedCategoryId) return [];
    return catalog.subcategories.filter(
      (s) => s.categoryId === selectedCategoryId
    );
  };

  const getAvailableOptions = () => {
    if (!selectedSubcategoryId) return [];
    return catalog.options.filter(
      (opt) => opt.subcategoryId === selectedSubcategoryId
    );
  };

  const getAvailableBrands = () => {
    if (!selectedCategoryId) return [];
    return catalog.brands.filter((b) =>
      b.categories.some((c: { id: string }) => c.id === selectedCategoryId)
    );
  };

  const selectedOptionsWithValues = useMemo(() => {
    if (!selectedOptionIds) return [];
    return selectedOptionIds
      .map((optId) => {
        const option = catalog.options.find((o) => o.id === optId);
        const values = catalog.optionValues
          .filter((v) => v.optionId === optId)
          .map((v) => v.value);
        return {
          id: optId,
          name: option?.name || "",
          values: ["N/A", ...values],
        };
      })
      .filter((opt) => opt.name);
  }, [selectedOptionIds, catalog.options, catalog.optionValues]);

  const handleOptionChange = (checked: boolean, optionId: string) => {
    const currentOptions = form.getValues("options") || [];
    if (!checked) {
      const optionToRemove = catalog.options.find((o) => o.id === optionId);
      if (optionToRemove) {
        const updatedVariants = form.getValues("variants").map((variant) => {
          const newVariant = { ...variant };
          delete newVariant[optionToRemove.name];
          return newVariant;
        });
        form.setValue("variants", updatedVariants);
      }
    }
    const newOptions = checked
      ? [...currentOptions, optionId]
      : currentOptions.filter((id) => id !== optionId);
    form.setValue("options", newOptions, { shouldValidate: true });
  };

  const handleAddVariant = () => {
    const newVariant: Variant = {
      price: form.getValues("price") || 0,
      stock: 0,
    };
    selectedOptionsWithValues.forEach((opt) => {
      newVariant[opt.name] = "N/A";
    });
    append(newVariant);
  };

  const resetVariantsAndOptions = () => {
    remove();
    form.setValue("options", []);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null);
    const processedValues = {
      ...values,
      variants: values.variants.map((variant) => {
        const processedVariant = { ...variant };
        Object.keys(processedVariant).forEach((key) => {
          if (processedVariant[key] === "N/A") {
            delete processedVariant[key];
          }
        });
        return processedVariant;
      }),
    };
    startTransition(async () => {
      let result;
      if (initialValues && (initialValues as any).id) {
        result = await updateProduct(
          (initialValues as any).id,
          processedValues
        );
      } else {
        result = await createProduct(processedValues);
      }
      if (result?.error) {
        setError(result.error);
        toast.error(
          result.error === "A product with this name already exists."
            ? "Product already exists. Please use a different name."
            : result.error
        );
      } else {
        toast.success(
          initialValues && (initialValues as any).id
            ? "Product updated successfully!"
            : "Product created successfully!"
        );
        router.push("/admin/products");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mb-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* --- LEFT COLUMN --- */}
          <div className="md:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>
                  Provide the name, description, and base price.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Premium Cotton T-Shirt"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detailed product description..."
                          className="min-h-24"
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
                      <FormLabel>Base Price ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="29.99"
                          {...field}
                          onChange={(e) => field.onChange(+e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>Upload at least one image.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ImageUpload
                          value={field.value.map((image) => image.url)}
                          onChange={(url: string) =>
                            field.onChange([...field.value, { url }])
                          }
                          onRemove={(url: string) =>
                            field.onChange(
                              field.value.filter(
                                (current) => current.url !== url
                              )
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
          {/* --- RIGHT COLUMN --- */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
                <CardDescription>Categorize your product.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          form.resetField("subcategoryId");
                          form.resetField("brandId");
                          resetVariantsAndOptions();
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {catalog.categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subcategoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          resetVariantsAndOptions();
                        }}
                        value={field.value}
                        disabled={!selectedCategoryId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subcategory" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getSubcategories().map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedCategoryId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getAvailableBrands().map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ProductStatus.options.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Featured Product</FormLabel>
                        <FormDescription>Display on homepage.</FormDescription>
                      </div>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* --- Variants Card --- */}
        {selectedSubcategoryId && (
          <Card>
            <CardHeader>
              <CardTitle>Product Variants</CardTitle>
              <CardDescription>
                Select options, then add variants one by one.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {getAvailableOptions().length > 0 && (
                <FormItem>
                  <FormLabel className="text-base">Available Options</FormLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                    {getAvailableOptions().map((option) => (
                      <FormField
                        key={option.id}
                        control={form.control}
                        name="options"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.id)}
                                onCheckedChange={(checked) =>
                                  handleOptionChange(
                                    checked as boolean,
                                    option.id
                                  )
                                }
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {option.name}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </FormItem>
              )}
              <div className="border-t pt-6">
                <Button
                  type="button"
                  onClick={handleAddVariant}
                  disabled={selectedOptionIds?.length === 0}
                >
                  Add Variant
                </Button>
                {selectedOptionIds?.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Please select an option to start adding variants.
                  </p>
                )}
              </div>
              {fields.length > 0 && (
                <div>
                  <div className="hidden md:block rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {selectedOptionsWithValues.map((opt) => (
                            <TableHead key={opt.id}>{opt.name}</TableHead>
                          ))}
                          <TableHead>Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fields.map((field, index) => (
                          <TableRow key={field.id}>
                            {selectedOptionsWithValues.map((opt) => (
                              <TableCell key={opt.id}>
                                <FormField
                                  control={form.control}
                                  name={`variants.${index}.${opt.name}`}
                                  render={({ field }) => (
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value as string}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {opt.values.map((val) => (
                                          <SelectItem key={val} value={val}>
                                            {val}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                />
                              </TableCell>
                            ))}
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`variants.${index}.price`}
                                render={({ field }) => (
                                  <Input
                                    type="number"
                                    placeholder="Price"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(+e.target.value)
                                    }
                                  />
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`variants.${index}.stock`}
                                render={({ field }) => (
                                  <Input
                                    type="number"
                                    placeholder="Stock"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(+e.target.value)
                                    }
                                  />
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                onClick={() => remove(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="block md:hidden space-y-4">
                    {fields.map((field, index) => (
                      <Card key={field.id}>
                        <CardHeader>
                          <CardTitle>Variant #{index + 1}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {selectedOptionsWithValues.map((opt) => (
                            <FormField
                              key={opt.id}
                              control={form.control}
                              name={`variants.${index}.${opt.name}`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{opt.name}</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value as string}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue
                                          placeholder={`Select ${opt.name}...`}
                                        />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {opt.values.map((val) => (
                                        <SelectItem key={val} value={val}>
                                          {val}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                          ))}
                          <Separator />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`variants.${index}.price`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Price</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="Price"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(+e.target.value)
                                      }
                                    />
                                  </FormControl>
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
                                      placeholder="Stock"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(+e.target.value)
                                      }
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            className="w-full text-destructive"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Remove Variant
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button disabled={isPending} type="submit" className="w-full md:w-auto">
          {isPending ? "Creating Product..." : initialValues ? "Update Product" : "Create Product"}
        </Button>
      </form>
    </Form>
  );
};
