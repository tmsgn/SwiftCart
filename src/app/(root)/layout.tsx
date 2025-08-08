import { Nav } from "./(routes)/components/nav-bar";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div >
      <Nav />
      {children}
    </div>
  );
}
