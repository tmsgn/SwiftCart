"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, ShoppingBag, User } from "lucide-react";

// Shadcn UI components
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Define the type for our category data
type CategoryWithSubcategories = {
  id: string;
  name: string;
  slug: string;
  subcategories: {
    id: string;
    name: string;
    slug: string;
  }[];
};

interface NavBarClientProps {
  categories: CategoryWithSubcategories[];
  user: any; // Replace 'any' with your actual user type
}

export function NavBarClient({ categories, user }: NavBarClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Choose your brand name! I'm using one of the names we generated.
  const brandName = "SwiftCart";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        
        {/* --- MOBILE MENU --- */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:w-[320px]">
              <Link href="/" className="mb-6 flex items-center">
                <span className="text-xl font-bold">{brandName}</span>
              </Link>
              <nav className="flex flex-col gap-4">
                {/* Mobile Category Accordion */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="categories">
                    <AccordionTrigger className="text-base font-semibold">
                      Categories
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col gap-1 pl-4">
                        {categories.map((category) => (
                           <Accordion key={category.id} type="single" collapsible>
                             <AccordionItem value={category.id}>
                               <AccordionTrigger>{category.name}</AccordionTrigger>
                               <AccordionContent className="pl-4">
                                 {category.subcategories.map((sub) => (
                                    <Link key={sub.id} href={`/category/${category.slug}/${sub.slug}`} className="block py-2 text-muted-foreground hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                                      {sub.name}
                                    </Link>
                                 ))}
                               </AccordionContent>
                             </AccordionItem>
                           </Accordion>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <Link href="/deals" className="text-base font-semibold" onClick={() => setIsMobileMenuOpen(false)}>Deals</Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* --- DESKTOP MENU --- */}
        <Link href="/" className="hidden items-center md:flex">
          <span className="text-2xl font-bold text-primary">{brandName}</span>
        </Link>
        
        <nav className="hidden items-center gap-4 md:flex">
          <NavigationMenu>
            <NavigationMenuList>
              {/* Categories Mega Menu */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-base">Categories</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[600px] grid-cols-3 gap-4 p-4 lg:w-[750px]">
                    {categories.map((category) => (
                      <div key={category.id} className="flex flex-col">
                        <Link href={`/category/${category.slug}`} className="mb-2 font-semibold text-primary hover:underline">
                          {category.name}
                        </Link>
                        <div className="flex flex-col gap-1">
                          {category.subcategories.map((sub) => (
                            <Link key={sub.id} href={`/category/${category.slug}/${sub.slug}`} passHref legacyBehavior>
                              <NavigationMenuLink className={`${navigationMenuTriggerStyle()} justify-start text-muted-foreground`}>
                                {sub.name}
                              </NavigationMenuLink>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/deals" legacyBehavior passHref>
                  <NavigationMenuLink className={`${navigationMenuTriggerStyle()} text-base`}>
                    Deals
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>
        
        {/* --- SEARCH & ICONS --- */}
        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
          <div className="relative hidden w-full max-w-xs sm:block">
            <Input type="search" placeholder="Search products..." className="pl-9" />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart">
              <ShoppingBag className="h-6 w-6" />
              <span className="sr-only">Shopping Cart</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href={user ? "/account" : "/signin"}>
              <User className="h-6 w-6" />
              <span className="sr-only">Account</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}