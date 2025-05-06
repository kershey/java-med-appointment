import type { Metadata } from 'next';
import { HeartPulse } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Java Medical Clinic - Authentication',
  description: 'Login, register or reset your password for Java Medical Clinic',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex flex-col">
      {/* Header with logo */}
      <header className="w-full py-4 px-6">
        <Link href="/" className="flex items-center">
          <HeartPulse className="h-7 w-7 text-primary" />
          <span className="ml-2 text-xl font-medium">Java Medical</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} Java Medical Clinic •{' '}
          <Link href="#" className="hover:text-primary">
            Privacy Policy
          </Link>{' '}
          •{' '}
          <Link href="#" className="hover:text-primary">
            Terms of Service
          </Link>
        </p>
      </footer>
    </div>
  );
}
