import type { Metadata, Viewport } from 'next';
import './globals.css';
import AppShell from '../components/AppShell';

export const metadata: Metadata = {
  title: 'VocabFlow - Học từ vựng tiếng Anh theo ngữ cảnh chuẩn',
  description: 'Ứng dụng học từ vựng tiếng Anh tiện lợi, audio chuẩn người bản xứ, luyện Nghe - Đọc - Viết và lặp lại ngắt quãng SRS.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

