import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const geist = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: 'Foresyte - AI News Feed for Prediction Markets',
  description: 'AI-powered curated news feed designed specifically for prediction market traders',
  generator: 'Foresyte',
  icons: {
    icon: [
      {
        url: '/Foresyte-logo/default.png',
        type: 'image/png',
        sizes: '192x192',
      },
      {
        url: '/Foresyte-logo/profile.png',
        type: 'image/png',
        sizes: '32x32',
      },
      {
        url: '/Foresyte-logo/vector/default.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/Foresyte-logo/default.png',
    shortcut: '/Foresyte-logo/default.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistMono.variable} font-mono antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
