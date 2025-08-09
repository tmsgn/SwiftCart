import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import React from "react";
import RootPageClient from "./page-clinet";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Seller Dashboard — SwiftCart",
  description: "Manage your SwiftCart store, products, and orders.",
  robots: { index: false },
};

const page = async () => {
  const { userId } = await auth();
  const store = await prismadb.store.findFirst({
    where: { userId: userId || "" },
  });
  if (!store) {
    return <RootPageClient />;
  }

  redirect(`/seller/${store.id}`);
};

export default page;
