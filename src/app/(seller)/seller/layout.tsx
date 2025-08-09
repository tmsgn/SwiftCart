import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import "@/app/globals.css";
import {
  IconDashboard,
  IconFolder,
  IconUsers,
  IconListDetails,
} from "@tabler/icons-react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ storeid?: string }>;
}>) {
  const { storeid } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const store = await prismadb.store.findFirst({
    where: {
      userId: userId || "",
    },
  });

  if (!store && storeid) {
    redirect("/seller");
  }

  if (!store && !storeid) {
    return <>{children}</>;
  }

  const resolvedStoreId = storeid ?? store?.id;
  const buildUrl = (suffix: string) =>
    resolvedStoreId ? `/seller/${resolvedStoreId}${suffix}` : "/seller";

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant="inset"
        navMain={[
          {
            title: "Dashboard",
            url: buildUrl(""),
            icon: <IconDashboard size={22} />,
          },
          {
            title: "Products",
            url: buildUrl("/products"),
            icon: <IconFolder size={22} />,
          },
          {
            title: "Customers",
            url: buildUrl("/users"),
            icon: <IconUsers size={22} />,
          },
          {
            title: "Orders",
            url: buildUrl("/orders"),
            icon: <IconListDetails size={22} />,
          },
        ]}
        user={{
          name: "shadcn",
          email: "m@example.com",
          avatar: "/avatars/shadcn.jpg",
        }}
      />
      <SidebarInset>
        <SiteHeader />
        <div className="px-2 mt-2">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
