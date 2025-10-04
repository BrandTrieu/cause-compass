import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/lib/env"; // Validate environment variables

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EthicalBrand - Company Ethical Alignment Tracker",
  description: "Discover how companies align with your values. Get personalized ethical scores, detailed breakdowns, and find better alternatives.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50`}
      >
        <div className="min-h-screen flex flex-col">
          <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <a href="/" className="text-xl font-bold text-gray-900">
                    EthicalBrand
                  </a>
                </div>
                <nav className="flex items-center space-x-4">
                  <a href="/search" className="text-gray-600 hover:text-gray-900">
                    Search
                  </a>
                  <a href="/dashboard/preferences" className="text-gray-600 hover:text-gray-900">
                    Preferences
                  </a>
                  <a href="/login" className="text-gray-600 hover:text-gray-900">
                    Sign In
                  </a>
                </nav>
              </div>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <p className="text-center text-gray-500 text-sm">
                © 2024 EthicalBrand. Making ethical choices easier.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
