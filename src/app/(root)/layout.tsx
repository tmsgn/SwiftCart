import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  const store = await prismadb.store.findFirst({
    where: {
      userId: userId || "",
    },
  });

  if (!userId) {
    redirect("/sign-in");
  }

  if (store) {
    redirect(`/${store.id}/admin`);
  }

  return <div className="bg-secondary">{children}</div>;
}
