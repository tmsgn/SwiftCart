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

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
            url: "/admin",
            icon: <IconDashboard size={22} />,
          },
          {
            title: "Products",
            url: "/admin/products",
            icon: <IconFolder size={22} />,
          },
          {
            title: "Customers",
            url: "/admin/users",
            icon: <IconUsers size={22} />,
          },
          {
            title: "Orders",
            url: "/admin/orders",
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
