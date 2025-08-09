import { Nav } from "./(routes)/components/nav-bar";
import Footer from "./(routes)/components/footer";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
