import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { CountryProvider } from '@/providers';
import { ToastContainer } from 'react-toastify';
import { UserProvider } from '@/providers/UserProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClassNet",
  description: "Virtual classroom for students and teachers"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CountryProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ThemeProvider attribute="class" enableSystem={false} defaultTheme="light">
            <main>
              <UserProvider>
                <Navbar />
                <ToastContainer />
                <div className="min-h-screen mt-16">
                  {children}
                </div>
              </UserProvider>
            </main>
          </ThemeProvider>
        </body>
      </html>
    </CountryProvider>
  );
}
