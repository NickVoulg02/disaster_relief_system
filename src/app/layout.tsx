import type { Metadata, Viewport } from 'next';
// @ts-expect-error Next.js loads this stylesheet at runtime.
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'Disaster Relief Coordination System',
  description:
    'Collaborative platform coordinating citizen aid requests, donations, volunteer rescue vehicles, and base warehouse inventory.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-rose-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

