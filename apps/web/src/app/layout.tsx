import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MoyVakil — Central Asia Legal Platform',
  description: 'Uzbekistan legal information and lawyer directory. Uzbek and Russian.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
