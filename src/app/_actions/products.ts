"use server";
import prismadb from "@/lib/prismadb";

// Types for input (should match your formSchema)
type ProductInput = {
  name: string;
  description: string;
  price: number;
  images: { url: string }[];
  categoryId: string;
  subcategoryId: string;
  brandId: string;
  isFeatured: boolean;
  status: "Available" | "Unavailable";
  options: string[];
  discountType?: "PERCENTAGE" | "FIXED" | null;
  discountValue?: number | null;
  variants: Array<{
    price: number;
    stock: number;
    [key: string]: any;
  }>;
};

export async function createProduct(data: ProductInput) {
  try {
    // Prevent duplicate product names
    const existing = await prismadb.product.findFirst({
      where: { name: data.name },
    });
    if (existing) {
      return { error: "A product with this name already exists." };
    }

    // Prepare variants with resolved optionValue connections
    const preparedVariants = await Promise.all(
      data.variants.map(async (variant) => {
        const { price, stock, ...optionValues } = variant;
        const optionValueCreates = await Promise.all(
          Object.entries(optionValues)
            .filter(([k, v]) => v && v !== "N/A")
            .map(async ([optionName, value]) => ({
              optionValue: {
                connect: await findOptionValueConnect(
                  optionName,
                  value,
                  data.options,
                  data.subcategoryId
                ),
              },
            }))
        );
        return {
          price,
          stock,
          optionValues: {
            create: optionValueCreates,
          },
        };
      })
    );

    // Generate a unique slug
    let baseSlug = slugify(data.name);
    let slug = baseSlug;
    let count = 1;
    while (await prismadb.product.findFirst({ where: { slug } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    const product = await prismadb.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        isFeatured: data.isFeatured,
        status: data.status,
        brandId: data.brandId,
        subcategoryId: data.subcategoryId,
        discountType: data.discountType ?? undefined,
        discountValue: data.discountValue ?? undefined,
        images: {
          create: data.images.map((img) => ({ url: img.url })),
        },
        options: {
          create: data.options.map((optionId) => ({ optionId })),
        },
        variants: {
          create: preparedVariants,
        },
      },
      include: { images: true, variants: true, options: true },
    });
    return { product };
  } catch (error: any) {
    return { error: error.message || "Failed to create product." };
  }
}

// Update product
export async function updateProduct(productId: string, data: ProductInput) {
  try {
    // Prevent duplicate product names (exclude current product)
    const existing = await prismadb.product.findFirst({
      where: {
        name: data.name,
        NOT: { id: productId },
      },
    });
    if (existing) {
      return { error: "A product with this name already exists." };
    }

    // Prepare variants with resolved optionValue connections
    const preparedVariants = await Promise.all(
      data.variants.map(async (variant) => {
        const { price, stock, ...optionValues } = variant;
        const optionValueCreates = await Promise.all(
          Object.entries(optionValues)
            .filter(([k, v]) => v && v !== "N/A")
            .map(async ([optionName, value]) => ({
              optionValue: {
                connect: await findOptionValueConnect(
                  optionName,
                  value,
                  data.options,
                  data.subcategoryId
                ),
              },
            }))
        );
        return {
          price,
          stock,
          optionValues: {
            create: optionValueCreates,
          },
        };
      })
    );

    // Generate a unique slug (if name changed)
    let baseSlug = slugify(data.name);
    let slug = baseSlug;
    let count = 1;
    while (
      await prismadb.product.findFirst({
        where: { slug, NOT: { id: productId } },
      })
    ) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    // Delete old variants/options/images (for simplicity)
    await prismadb.variant.deleteMany({ where: { productId } });
    await prismadb.productOption.deleteMany({ where: { productId } });
    await prismadb.image.deleteMany({ where: { productId } });

    const product = await prismadb.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        isFeatured: data.isFeatured,
        status: data.status,
        brandId: data.brandId,
        subcategoryId: data.subcategoryId,
        discountType: data.discountType ?? undefined,
        discountValue: data.discountValue ?? undefined,
        images: {
          create: data.images.map((img) => ({ url: img.url })),
        },
        options: {
          create: data.options.map((optionId) => ({ optionId })),
        },
        variants: {
          create: preparedVariants,
        },
      },
      include: { images: true, variants: true, options: true },
    });
    return { product };
  } catch (error: any) {
    return { error: error.message || "Failed to update product." };
  }
}

// Helper: slugify product name
function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function findOptionValueConnect(
  optionName: string,
  value: string,
  optionIds: string[],
  subcategoryId: string
) {
  const option = await prismadb.option.findFirst({
    where: { name: optionName, subcategoryId },
  });
  if (!option) throw new Error(`Option not found: ${optionName}`);

  const optionValue = await prismadb.optionValue.findFirst({
    where: { value, optionId: option.id },
  });
  if (!optionValue) throw new Error(`Option value not found: ${value}`);
  return { id: optionValue.id };
}
