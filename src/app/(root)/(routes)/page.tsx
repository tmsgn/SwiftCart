import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import RootPageClient from "./page-clinet";

const RootPage = async () => {
  const { userId } = await auth();
  const store = await prismadb.store.findFirst({
    where: {
      userId: userId || undefined,
    },
  });

  if (store) {
    redirect(`/${store.id}/admin`);
  }

  return <RootPageClient/>
};

export default RootPage;
