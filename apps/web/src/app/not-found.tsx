import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <AlertTriangle className="h-16 w-16 text-accent mb-6" />
      <h1 className="text-3xl font-bold text-text mb-3">404</h1>
      <p className="text-text-muted text-lg mb-6">Page not found</p>
      <Button asChild>
        <Link href="/uz">Back to Home</Link>
      </Button>
    </div>
  );
}
