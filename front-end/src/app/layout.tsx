import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MeoPanel',
  description: 'MeoPanel Client Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}