"use client";
import React, { useState } from "react";
import { Search, Menu, X, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useCart } from "@/hooks/use-cart";

export const Nav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items } = useCart();
  const count = items.reduce((a, b) => a + b.quantity, 0);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/about", label: "About Us" },
    { href: "/myorders", label: "My Orders" },
  ];
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="h-1.5 bg-orange-900"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold">
              <span className="text-gray-900">Swift</span>
              <span className="text-orange-600">Cart</span>
            </Link>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/seller"
              className="bg-gray-100 text-gray-800 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200"
            >
              Seller Dashboard
            </Link>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              className="text-gray-500 hover:text-orange-600 p-2 rounded-full transition-colors duration-200"
              aria-label="Search"
            >
              <Search size={22} />
            </button>
            <Link
              href="/cart"
              className="text-gray-600 hover:text-orange-600 p-2 rounded-md flex items-center gap-2 transition-colors duration-200 relative"
              aria-label="Cart"
            >
              <ShoppingCart size={22} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs leading-4 h-4 text-center w-4 rounded-full">
                  {count}
                </span>
              )}
              <span className="hidden sm:inline text-sm font-medium">Cart</span>
            </Link>

            <SignedIn>
              <UserButton
                appearance={{ elements: { userButtonAvatarBox: "w-9 h-9" } }}
                afterSignOutUrl="/"
              />
            </SignedIn>
            <SignedOut>
              <Link
                href="/sign-in"
                className="bg-orange-600 text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-orange-700 transition-colors duration-200"
              >
                Sign in
              </Link>
            </SignedOut>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-orange-600 p-2 rounded-md"
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-white border-t border-gray-200"
        >
          <div className="px-2 pt-2 pb-4 space-y-2 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/seller"
              className="block w-full text-left bg-gray-100 text-gray-800 hover:bg-gray-200 px-3 py-3 rounded-lg text-base font-semibold transition-colors duration-200 mt-2"
            >
              Seller Dashboard
            </Link>
            <Link
              href="/cart"
              className="block w-full text-left text-gray-700 hover:text-orange-600 hover:bg-gray-50 px-3 py-3 rounded-lg text-base font-medium transition-colors duration-200 relative"
            >
              <span className="inline-flex items-center gap-2">
                <ShoppingCart size={20} /> Cart
                {count > 0 && (
                  <span className="ml-2 bg-orange-600 text-white text-[10px] leading-4 px-1.5 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </span>
            </Link>
            <div className="mt-2">
              <SignedOut>
                <Link
                  href="/sign-in"
                  className="block w-full text-left bg-orange-600 text-white px-3 py-3 rounded-lg text-base font-semibold hover:bg-orange-700 transition-colors duration-200"
                >
                  Sign in
                </Link>
              </SignedOut>
              <SignedIn>
                <div className="px-3 py-2">
                  <UserButton
                    appearance={{
                      elements: { userButtonAvatarBox: "w-8 h-8" },
                    }}
                    afterSignOutUrl="/"
                  />
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
