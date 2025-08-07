"use client";
import React, { useState } from "react";
import { Search, Menu, X } from "lucide-react";

export const Nav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "#", label: "Home" },
    { href: "#", label: "Shop" },
    { href: "#", label: "About Us" },
    { href: "#", label: "Contact" },
  ];
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="h-1.5 bg-orange-900"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <a href="#" className="text-2xl font-bold">
              <span className="text-gray-900">Quick</span>
              <span className="text-orange-600">Cart</span>
            </a>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#"
              className="bg-gray-100 text-gray-800 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200"
            >
              Seller Dashboard
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-orange-600 p-2 rounded-full transition-colors duration-200">
              <Search size={22} />
            </button>
            <button className="bg-orange-600 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm hover:bg-orange-700 transition-colors duration-200">
              T
            </button>

           
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-orange-600 p-2 rounded-md"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

     
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-4 space-y-2 sm:px-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#"
              className="block w-full text-left bg-gray-100 text-gray-800 hover:bg-gray-200 px-3 py-3 rounded-lg text-base font-semibold transition-colors duration-200 mt-2"
            >
              Seller Dashboard
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
