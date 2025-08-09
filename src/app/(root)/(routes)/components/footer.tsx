import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();
  

  return (
    <footer className="bg-white border-t mt-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-2">
            <Link href="/" className="text-2xl font-bold">
              <span className="text-gray-900">Swift</span>
              <span className="text-orange-600">Cart</span>
            </Link>
            <p className="text-sm text-gray-500 max-w-sm">
              Quality products, seamless checkout, and fast delivery.
            </p>
          </div>
          
        </div>
      </div>
      <div className="border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 text-sm text-gray-500 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p>© {year} SwiftCart. All rights reserved.</p>
          <p>
            Built with{" "}
            <span className="text-orange-600 font-medium">Next.js</span>.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
