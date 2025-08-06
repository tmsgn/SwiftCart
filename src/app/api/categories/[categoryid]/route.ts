import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

type ParamsType = { params: { categoryid: string } };

export async function GET(request: Request, { params }: ParamsType) {
  const categoryId = params.categoryid;
  if (!categoryId) {
    return NextResponse.json({ variants: [] });
  }

  // Find the category and its linked variants
  const category = await prismadb.category.findUnique({
    where: { id: categoryId },
    include: {
      variants: {
        include: {
          values: true,
        },
      },
    },
  });

  if (!category) {
    return NextResponse.json({ variants: [] });
  }

  return NextResponse.json({ variants: category.variants });
}
