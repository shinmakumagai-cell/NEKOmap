import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
}

export const metadata: Metadata = {
  title: '猫マップ — 近所の猫スポットを共有しよう',
  description: '近所で会える猫のスポットをみんなで共有するマップアプリ',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '猫マップ',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <Header />
        <main className="pt-14 h-[100dvh]">
          {children}
        </main>
      </body>
    </html>
  )
}
