import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Provider } from "../src/components/Provider";
// Import komponen navbar pintar yang baru kita buat
import BottomNavbar from "../src/components/BottomNavbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Asuka - AI Chat",
  description: "Platform chat AI personal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#FFF0F5] min-h-screen flex flex-col"> {/* Pink lembut */}
        <Provider>
          <main className="flex-1 overflow-y-auto pb-24">
            {children}
          </main>
          
          {/* PANGGILAN NAVBAR PINTAR (Otomatis deteksi login/logout) */}
          <BottomNavbar />
        </Provider>
      </body>
    </html>
  );
}