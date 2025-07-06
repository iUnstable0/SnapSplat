import { BlurContextProvider } from "@/components/blur-context";

import Navbar from "./_components/navbar";
import "./globals.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <BlurContextProvider>
      <Navbar />
      {children}
    </BlurContextProvider>
  );
}
