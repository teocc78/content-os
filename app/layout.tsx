import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from './sidebar'

export const metadata: Metadata = {
  title: 'Content OS',
  description: 'Instagram content analytics dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex h-screen" style={{ backgroundColor: '#0a0a0a' }}>
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  )
}
