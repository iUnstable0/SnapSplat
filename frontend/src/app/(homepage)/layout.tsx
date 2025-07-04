import Header from "./_components/header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <meta name="viewport" content="initial-scale=1, viewport-fit=cover" />

      <Header />
      {children}
    </>
  );
}
