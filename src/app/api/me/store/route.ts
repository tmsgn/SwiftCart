import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const store = await prismadb.store.findFirst({ where: { userId } });
  if (!store) return NextResponse.json({ storeId: null }, { status: 200 });

  return NextResponse.json({ storeId: store.id });
}
