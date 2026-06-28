import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/All/Navbar";
import Footer from "@/components/All/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Kino.com",
  description: "Second hand marketplace - buy and sell used items with ease",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning={true}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <main className="max-w-screen mx-auto w-full">
            <Navbar />
            {children}
            <Footer />
            <Toaster />
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
