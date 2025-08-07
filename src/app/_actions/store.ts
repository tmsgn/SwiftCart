import prismadb from "@/lib/prismadb";

export async function createStore({
  name,
  userId,
}: {
  name: string;
  userId: string;
}) {
  if (!name || !userId) throw new Error("Missing store name or userId");
  const store = await prismadb.store.create({
    data: {
      name,
      userId,
    },
  });
  return store;
}
