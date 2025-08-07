import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  try {
    const { name, userId } = await req.json();
    if (!name || !userId) {
      return NextResponse.json(
        { error: "Missing name or userId" },
        { status: 400 }
      );
    }
    const store = await prismadb.store.create({
      data: {
        name,
        userId,
      },
    });
    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create store" },
      { status: 500 }
    );
  }
}
