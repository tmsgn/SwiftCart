import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

async function main() {
  console.log("🚀 Start seeding large-scale catalog structure...");

  console.log("🧹 Deleting existing data...");
  // This order respects foreign key constraints for a clean wipe.
  // Corrected to match your specific schema.
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.variantOption.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.productOption.deleteMany();
  await prisma.image.deleteMany();
  await prisma.product.deleteMany();
  await prisma.optionValue.deleteMany();
  await prisma.option.deleteMany();
  await prisma.subcategory.deleteMany();
  // The many-to-many relation between Brand and Category must be cleared before deleting the models
  // Skipped: prisma.category.updateMany({ data: { brands: { set: [] } } }); // Not valid in Prisma
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  // No 'Store' or 'OrderProduct' in your schema, so they are removed from here.

  console.log("🌱 Creating 14 Top-Level Categories...");
  const categoriesData = [
    { name: "Men's Fashion" },
    { name: "Women's Fashion" },
    { name: "Electronics" },
    { name: "Home & Living" },
    { name: "Health & Beauty" },
    { name: "Sports & Outdoors" },
    { name: "Toys & Hobbies" },
    { name: "Books, Music & Media" },
    { name: "Groceries & Gourmet Food" },
    { name: "Automotive & Industrial" },
    { name: "Office & Stationery" },
    { name: "Pet Supplies" },
    { name: "Jewelry & Accessories" },
    { name: "Tools & Home Improvement" },
  ].map((c) => ({ ...c, slug: slugify(c.name) }));

  await prisma.category.createMany({ data: categoriesData });
  const createdCategories = await prisma.category.findMany();
  const categoryMap = new Map(createdCategories.map((c) => [c.name, c.id]));
  console.log(`✅ Created ${createdCategories.length} categories.`);

  console.log("🌱 Creating 75+ Brands and linking to categories...");
  const brandsData = [
    // Fashion
    {
      name: "Nike",
      categories: [
        "Men's Fashion",
        "Women's Fashion",
        "Sports & Outdoors",
        "Jewelry & Accessories",
      ],
    },
    {
      name: "Adidas",
      categories: ["Men's Fashion", "Women's Fashion", "Sports & Outdoors"],
    },
    { name: "Levi's", categories: ["Men's Fashion", "Women's Fashion"] },
    { name: "Zara", categories: ["Men's Fashion", "Women's Fashion"] },
    {
      name: "Gucci",
      categories: ["Men's Fashion", "Women's Fashion", "Jewelry & Accessories"],
    },
    {
      name: "The North Face",
      categories: ["Men's Fashion", "Women's Fashion", "Sports & Outdoors"],
    },
    {
      name: "Rolex",
      categories: ["Jewelry & Accessories", "Men's Fashion"],
    },
    { name: "Ray-Ban", categories: ["Jewelry & Accessories"] },

    // Electronics
    { name: "Apple", categories: ["Electronics", "Office & Stationery"] },
    { name: "Samsung", categories: ["Electronics", "Home & Living"] },
    { name: "Sony", categories: ["Electronics", "Books, Music & Media"] },
    { name: "Dell", categories: ["Electronics", "Office & Stationery"] },
    { name: "Bose", categories: ["Electronics"] },
    { name: "Canon", categories: ["Electronics"] },
    { name: "GoPro", categories: ["Electronics", "Sports & Outdoors"] },
    { name: "Garmin", categories: ["Electronics", "Sports & Outdoors"] },
    { name: "Microsoft", categories: ["Electronics", "Office & Stationery"] },
    { name: "Logitech", categories: ["Electronics", "Office & Stationery"] },
    { name: "Razer", categories: ["Electronics", "Toys & Hobbies"] },
    { name: "Nvidia", categories: ["Electronics"] },

    // Home, Tools & Garden
    { name: "IKEA", categories: ["Home & Living", "Office & Stationery"] },
    { name: "Dyson", categories: ["Home & Living"] },
    {
      name: "Philips",
      categories: ["Home & Living", "Health & Beauty", "Electronics"],
    },
    { name: "KitchenAid", categories: ["Home & Living"] },
    {
      name: "Nespresso",
      categories: ["Home & Living", "Groceries & Gourmet Food"],
    },
    { name: "DeWalt", categories: ["Tools & Home Improvement"] },
    { name: "Makita", categories: ["Tools & Home Improvement"] },
    {
      name: "Bosch",
      categories: ["Tools & Home Improvement", "Automotive & Industrial"],
    },

    // Health & Beauty
    { name: "L'Oréal", categories: ["Health & Beauty"] },
    { name: "Gillette", categories: ["Health & Beauty"] },
    { name: "Nivea", categories: ["Health & Beauty"] },
    { name: "Sephora", categories: ["Health & Beauty"] },

    // Toys, Books & Hobbies
    { name: "Lego", categories: ["Toys & Hobbies"] },
    { name: "Hasbro", categories: ["Toys & Hobbies"] },
    { name: "Mattel", categories: ["Toys & Hobbies"] },
    { name: "Nintendo", categories: ["Electronics", "Toys & Hobbies"] },
    { name: "PlayStation", categories: ["Electronics", "Toys & Hobbies"] },
    { name: "Penguin Random House", categories: ["Books, Music & Media"] },
    { name: "Fender", categories: ["Books, Music & Media", "Toys & Hobbies"] },

    // Food & Pet
    {
      name: "Nestlé",
      categories: ["Groceries & Gourmet Food", "Pet Supplies"],
    },
    { name: "Coca-Cola", categories: ["Groceries & Gourmet Food"] },
    { name: "Starbucks", categories: ["Groceries & Gourmet Food"] },
    { name: "Purina", categories: ["Pet Supplies"] },
    { name: "Royal Canin", categories: ["Pet Supplies"] },

    // Automotive & Office
    { name: "Michelin", categories: ["Automotive & Industrial"] },
    {
      name: "3M",
      categories: [
        "Automotive & Industrial",
        "Office & Stationery",
        "Tools & Home Improvement",
      ],
    },
    { name: "Moleskine", categories: ["Office & Stationery"] },
  ];

  for (const brand of brandsData) {
    const categoryIds = brand.categories
      .map((name) => categoryMap.get(name))
      .filter((id): id is string => Boolean(id))
      .map((id) => ({ id }));
    if (categoryIds.length > 0) {
      await prisma.brand.create({
        data: {
          name: brand.name,
          slug: slugify(brand.name),
          categories: { connect: categoryIds },
        },
      });
    }
  }
  console.log(`✅ Created ${brandsData.length} brands.`);

  console.log("🌱 Creating Subcategories with Options and Values...");
  const subcategoryDefinitions: Record<
    string,
    { name: string; options: string[] }[]
  > = {
    "Men's Fashion": [
      { name: "Tops", options: ["Color", "Size", "Material", "Fit"] },
      { name: "Bottoms", options: ["Color", "Waist", "Length", "Material"] },
      { name: "Outerwear", options: ["Color", "Size", "Material"] },
      { name: "Footwear", options: ["Color", "Shoe Size", "Material"] },
    ],
    "Women's Fashion": [
      { name: "Dresses", options: ["Color", "Size", "Material", "Length"] },
      { name: "Tops & Blouses", options: ["Color", "Size", "Sleeve Style"] },
      { name: "Handbags", options: ["Color", "Material", "Style"] },
    ],
    Electronics: [
      { name: "Computers & Laptops", options: ["RAM", "Storage", "Processor"] },
      {
        name: "Smartphones & Tablets",
        options: ["Color", "Storage", "Screen Size"],
      },
      {
        name: "Audio & Headphones",
        options: ["Color", "Type", "Connectivity"],
      },
      {
        name: "Wearable Technology",
        options: ["Color", "Case Size", "Compatibility"],
      },
    ],
    "Home & Living": [
      { name: "Furniture", options: ["Material", "Color", "Style"] },
      { name: "Bedding & Bath", options: ["Material", "Color", "Size"] },
      { name: "Kitchen & Dining", options: ["Material", "Type", "Capacity"] },
      { name: "Home Decor", options: ["Material", "Color", "Style"] },
    ],
    "Health & Beauty": [
      { name: "Skincare", options: ["Skin Type", "Formulation", "Volume"] },
      { name: "Makeup", options: ["Shade", "Finish", "Type"] },
      { name: "Hair Care", options: ["Hair Type", "Scent", "Volume"] },
    ],
    "Sports & Outdoors": [
      {
        name: "Athletic Apparel",
        options: ["Color", "Size", "Material", "Sport"],
      },
      { name: "Exercise & Fitness", options: ["Weight", "Type", "Material"] },
      { name: "Camping & Hiking", options: ["Capacity", "Type"] },
    ],
    "Toys & Hobbies": [
      { name: "Building Sets & Blocks", options: ["Pieces", "Age Range"] },
      { name: "Games & Puzzles", options: ["Game Type", "Player Count"] },
    ],
    "Books, Music & Media": [
      { name: "Books", options: ["Format", "Genre", "Language"] },
      { name: "Music", options: ["Format", "Artist", "Genre"] },
    ],
    "Groceries & Gourmet Food": [
      { name: "Beverages", options: ["Type", "Flavor", "Package Size"] },
      { name: "Snacks", options: ["Flavor", "Dietary Feature"] },
    ],
    "Automotive & Industrial": [
      { name: "Car Care", options: ["Type", "Application"] },
      { name: "Oils & Fluids", options: ["Type", "Viscosity", "Volume"] },
    ],
    "Office & Stationery": [
      { name: "Pens & Writing", options: ["Type", "Ink Color"] },
      { name: "Notebooks & Paper", options: ["Size", "Paper Type"] },
    ],
    "Pet Supplies": [
      { name: "Dog Supplies", options: ["Life Stage", "Flavor", "Type"] },
      { name: "Cat Supplies", options: ["Life Stage", "Flavor", "Type"] },
    ],
    "Jewelry & Accessories": [
      {
        name: "Watches",
        options: ["Movement", "Case Material", "Band Material"],
      },
      { name: "Fashion Jewelry", options: ["Material", "Style"] },
    ],
    "Tools & Home Improvement": [
      { name: "Power Tools", options: ["Power Source", "Brand", "Type"] },
      { name: "Hardware", options: ["Type", "Finish", "Material"] },
    ],
  };

  const optionValueDefinitions: Record<string, string[]> = {
    Color: ["Black", "White", "Gray", "Red", "Blue", "Green", "Silver", "Gold"],
    Material: [
      "Cotton",
      "Polyester",
      "Leather",
      "Denim",
      "Wood",
      "Metal",
      "Plastic",
    ],
    Size: ["S", "M", "L", "XL", "XXL"],
    Fit: ["Slim", "Regular", "Relaxed"],
    "Sleeve Style": ["Short Sleeve", "Long Sleeve", "Sleeveless"],
    Waist: ["28", "30", "32", "34", "36"],
    Length: ["Short", "Regular", "Long", "Maxi", "Midi"],
    "Shoe Size": ["7", "8", "9", "10", "11", "12"],
    Style: ["Modern", "Traditional", "Minimalist", "Vintage"],
    Storage: ["128GB", "256GB", "512GB", "1TB"],
    RAM: ["8GB", "16GB", "32GB"],
    Processor: ["Intel i7", "AMD Ryzen 7", "Apple M2"],
    "Screen Size": ['13"', '15"', '27"', '65"'],
    Type: [
      "Over-Ear",
      "In-Ear",
      "Sofa",
      "Chair",
      "Drill",
      "Wrench",
      "Shampoo",
      "Serum",
    ],
    Connectivity: ["Bluetooth", "Wired", "Wi-Fi"],
    "Case Size": ["40mm", "41mm", "44mm", "45mm"],
    Compatibility: ["iOS", "Android", "Universal"],
    Capacity: ["1-Person", "4-Person", "6-Quart"],
    "Skin Type": ["Oily", "Dry", "Combination", "Sensitive"],
    Formulation: ["Cream", "Serum", "Gel"],
    Volume: ["50ml", "100ml", "250ml"],
    Shade: ["Light", "Medium", "Dark"],
    Finish: ["Matte", "Glossy", "Satin", "Chrome"],
    "Hair Type": ["Fine", "Thick", "Curly"],
    Scent: ["Unscented", "Floral", "Citrus"],
    Sport: ["Running", "Basketball", "Yoga"],
    Weight: ["5 lbs", "10 lbs", "20 lbs"],
    Pieces: ["100-250", "251-500", "1000+"],
    "Age Range": ["3-5 years", "6-8 years", "13+"],
    "Game Type": ["Board Game", "Card Game", "Strategy"],
    "Player Count": ["2", "2-4", "4+"],
    Format: ["Hardcover", "Paperback", "Vinyl", "CD", "Blu-ray"],
    Genre: ["Fiction", "Non-fiction", "Rock", "Pop"],
    Language: ["English", "Spanish", "French"],
    Artist: ["Artist A", "Artist B", "Artist C"],
    Flavor: ["Chicken", "Beef", "Vanilla", "Chocolate"],
    "Package Size": ["12oz", "1L", "Family Pack"],
    "Dietary Feature": ["Vegan", "Gluten-Free", "Organic"],
    Application: ["Wash", "Wax", "Polish"],
    Viscosity: ["5W-30", "10W-40"],
    "Ink Color": ["Black", "Blue", "Red"],
    "Paper Type": ["Lined", "Grid", "Blank"],
    "Life Stage": ["Puppy", "Adult", "Senior", "Kitten"],
    Movement: ["Quartz", "Automatic"],
    "Case Material": ["Stainless Steel", "Titanium"],
    "Band Material": ["Leather", "Silicone"],
    "Power Source": ["Battery", "Corded-Electric"],
    Brand: brandsData.map((b) => b.name), // Dynamically use created brands
  };

  let subcategoryCount = 0;
  for (const [catName, subcats] of Object.entries(subcategoryDefinitions)) {
    const categoryId = categoryMap.get(catName);
    if (!categoryId) continue;

    for (const subcatData of subcats) {
      const subcategory = await prisma.subcategory.create({
        data: { name: subcatData.name, categoryId: categoryId },
      });
      subcategoryCount++;
      for (const optionName of subcatData.options) {
        const option = await prisma.option.create({
          data: { name: optionName, subcategoryId: subcategory.id },
        });

        const values = optionValueDefinitions[optionName];

        if (values && values.length > 0) {
          await prisma.optionValue.createMany({
            data: values.map((value) => ({ value, optionId: option.id })),
          });
        }
      }
    }
  }

  console.log(
    `✅ Created ${subcategoryCount} subcategories with their associated options and values.`
  );
  console.log(
    "✅ Catalog structure seeding finished successfully. The database is ready."
  );
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
