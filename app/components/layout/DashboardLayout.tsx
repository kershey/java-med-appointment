'use client';

import { ReactNode } from 'react';
import Navbar from './Navbar';
import { useAuth } from '@/app/contexts/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="md:pl-64 pt-16 md:pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
