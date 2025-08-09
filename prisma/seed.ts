import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log(`Clearing previous catalog data...`);
  // Delete in child->parent order to satisfy FKs
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.billboard.deleteMany();
  await prisma.image.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.variantValue.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.address.deleteMany();
  await prisma.buyer.deleteMany();
  await prisma.store.deleteMany();

  console.log(`Start seeding catalog data...`);

  const variantsData = [
    {
      name: "Color",
      values: [
        "Black",
        "White",
        "Gray",
        "Blue",
        "Red",
        "Green",
        "Silver",
        "Gold",
        "Beige",
        "Navy",
      ],
    },
    { name: "Size", values: ["XS", "S", "M", "L", "XL", "XXL", "One Size"] },
    {
      name: "Apparel Style",
      values: [
        "T-Shirt",
        "Hoodie",
        "Jacket",
        "Jeans",
        "Shorts",
        "Sweater",
        "Dress",
      ],
    },
    {
      name: "Material",
      values: [
        "Cotton",
        "Polyester",
        "Wool",
        "Leather",
        "Denim",
        "Aluminum",
        "Plastic",
        "Wood",
      ],
    },
    { name: "Shoe Size (US)", values: ["6", "7", "8", "9", "10", "11", "12"] },
    { name: "Storage", values: ["128GB", "256GB", "512GB", "1TB"] },
    {
      name: "Screen Size",
      values: ["13-inch", "15-inch", "16-inch", "27-inch"],
    },
    {
      name: "Processor",
      values: ["Core i5", "Core i7", "M3", "M3 Pro", "M3 Max"],
    },
    {
      name: "Format",
      values: ["Hardcover", "Paperback", "Audiobook", "eBook"],
    },
    { name: "Weight", values: ["5kg", "10kg", "15kg", "20kg"] },
  ];

  console.log("Seeding Variants and VariantValues...");
  const variantsMap = new Map<string, { id: string }>();
  for (const variant of variantsData) {
    const createdVariant = await prisma.variant.create({
      data: { name: variant.name },
    });
    variantsMap.set(variant.name, { id: createdVariant.id });
    for (const value of variant.values) {
      await prisma.variantValue.create({
        data: {
          value,
          variantId: createdVariant.id,
        },
      });
    }
  }

  const categoryData = [
    {
      name: "Electronics",
      subCategories: [
        { name: "Smartphones", variants: ["Color", "Storage"] },
        {
          name: "Laptops",
          variants: ["Color", "Storage", "Screen Size", "Processor"],
        },
        { name: "Headphones", variants: ["Color", "Material"] },
        { name: "Cameras", variants: ["Color"] },
      ],
    },
    {
      name: "Fashion",
      subCategories: [
        {
          name: "Men's Clothing",
          variants: ["Color", "Size", "Apparel Style", "Material"],
        },
        {
          name: "Women's Clothing",
          variants: ["Color", "Size", "Apparel Style", "Material"],
        },
        {
          name: "Men's Shoes",
          variants: ["Color", "Shoe Size (US)", "Material"],
        },
        {
          name: "Women's Shoes",
          variants: ["Color", "Shoe Size (US)", "Material"],
        },
      ],
    },
    {
      name: "Home & Kitchen",
      subCategories: [
        { name: "Furniture", variants: ["Color", "Material"] },
        { name: "Cookware", variants: ["Material", "Size"] },
        { name: "Bedding", variants: ["Color", "Size", "Material"] },
        { name: "Home Decor", variants: ["Color", "Material"] },
      ],
    },
    {
      name: "Health & Beauty",
      subCategories: [
        { name: "Skincare", variants: ["Size"] },
        { name: "Makeup", variants: ["Color"] },
        { name: "Hair Care", variants: ["Size"] },
        { name: "Vitamins & Supplements", variants: ["Size"] },
      ],
    },
    {
      name: "Books & Media",
      subCategories: [
        { name: "Fiction Books", variants: ["Format"] },
        { name: "Non-Fiction Books", variants: ["Format"] },
        { name: "Vinyl Records", variants: [] },
      ],
    },
    {
      name: "Sports & Outdoors",
      subCategories: [
        { name: "Fitness Equipment", variants: ["Color", "Weight"] },
        { name: "Camping Gear", variants: ["Color", "Size"] },
        { name: "Cycling", variants: ["Color", "Size"] },
      ],
    },
  ];

  console.log("Seeding Categories and linking Variants to Subcategories...");
  for (const cat of categoryData) {
    const parentCategory = await prisma.category.create({
      data: { name: cat.name },
    });
    console.log(`Created Category: ${cat.name}`);

    for (const sub of cat.subCategories) {
      const variantIdsToConnect = sub.variants
        .map((variantName) => variantsMap.get(variantName)?.id)
        .filter((id): id is string => !!id);

      await prisma.category.create({
        data: {
          name: sub.name,
          parentId: parentCategory.id,
          variants: {
            connect: variantIdsToConnect.map((id) => ({ id })),
          },
        },
      });
      console.log(`  - Created Subcategory: ${sub.name}`);
    }
  }

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
