// ============================================================
// CreatorAI Studio — Root Layout
// ============================================================

import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/shared/auth-provider';

export const metadata: Metadata = {
  title: 'CreatorAI Studio',
  description: 'AI-powered content creation platform — your complete AI employee for social media',
  keywords: ['AI', 'content creation', 'video generation', 'social media', 'automation'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-surface-950 text-surface-100 antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
