import type { Metadata } from "next";
import "./globals.css";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { UserProvider } from "@/components/context/UserContext";

export const metadata: Metadata = {
  title: "Sakura Flashcards",
  description:
    "A flashcard app for learning Japanese using the Genki textbook series.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="dark font-sans">
        <div className="flex flex-col relative min-h-dvh">
          <UserProvider>
            <Header />
            <main className="flex-1 py-8">{children}</main>
            {/* Background Pattern */}
            <div className="fixed inset-0 w-full h-full -z-10 bg-pattern" />
            <ScrollToTopButton />
            <Footer />
          </UserProvider>
        </div>
      </body>
    </html>
  );
}
