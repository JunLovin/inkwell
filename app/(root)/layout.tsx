import { ReactLenis } from "lenis/react";
import Header from "@/shared/components/layout/Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <ReactLenis root />
      {children}
    </>
  );
}
