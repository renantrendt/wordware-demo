import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { CrispChat } from "@/components/crisp-chat"
import { ProductTour } from "@/components/product-tour"
import type React from "react"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Wordware.ai Head of Customer",
  description: "Customer Success Intelligence Platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body>
        <div className="flex h-screen bg-[#121212] text-white font-inter">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
          <CrispChat />
          <ProductTour />
        </div>
      </body>
    </html>
  )
}

