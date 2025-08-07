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
import { Toaster } from "sonner";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
  params: { storeid },
}: Readonly<{
  children: React.ReactNode;
  params: { storeid: string };
}>) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const store = await prismadb.store.findFirst({
    where: {
      id: storeid,
      userId: userId || "",
    },
  });

  if (!store) {
    redirect("/sign-in");
  }

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
            url: `/${storeid}/admin`,
            icon: <IconDashboard size={22} />,
          },
          {
            title: "Products",
            url: `/${storeid}/admin/products`,
            icon: <IconFolder size={22} />,
          },
          {
            title: "Customers",
            url: `/${storeid}/admin/users`,
            icon: <IconUsers size={22} />,
          },
          {
            title: "Orders",
            url: `/${storeid}/admin/orders`,
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
        <div className="px-2 mt-2">
          <Toaster/>
          {children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
