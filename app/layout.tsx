import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '猫マップ — 近所の猫スポットを共有しよう',
  description: '近所で会える猫のスポットをみんなで共有するマップアプリ',
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
        <main className="pt-14 h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
