import './globals.css';

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { getLocale } from 'next-intl/server';
import NextTopLoader from 'nextjs-toploader';

import { Toaster } from '@/components/ui/sonner';
import RootProvider from '@/providers/root-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Hirelytics - AI Interview Platform',
  description: 'Login to Hirelytics AI Interview Platform',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <RootProvider>
          <NextTopLoader color="hsl(var(--primary))" />
          {children}
          <Toaster richColors />
        </RootProvider>
      </body>
    </html>
  );
}
