import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Next.js i18n Example',
  description: 'Demo of @ldesign/i18n-nextjs',
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
