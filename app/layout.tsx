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
        {/* pb-14 reserves space for the mobile tab bar */}
        <div className="flex-1 flex flex-col overflow-hidden pb-14 md:pb-0">
          {children}
        </div>
      </body>
    </html>
  )
}
