'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/app/firebase/auth';
import {
  CalendarDays,
  Users,
  Home,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  HeartPulse,
  Mail,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Handle authentication and redirects
  useEffect(() => {
    console.log('[DashboardLayout] Auth state:', {
      loading,
      user: !!user,
      userRole,
    });

    // Check if we have any redirection flags
    const hasStaffRedirectFlag =
      sessionStorage.getItem('redirectToStaffDashboard') === 'true';

    if (!loading && !user) {
      console.log('[DashboardLayout] No user detected, redirecting to login');

      if (pathname.includes('/staff')) {
        router.push('/auth/login/staff');
      } else if (pathname.includes('/doctor')) {
        router.push('/auth/login/doctor');
      } else if (pathname.includes('/admin')) {
        router.push('/auth/login/admin');
      } else if (pathname.includes('/patient')) {
        router.push('/auth/login/patient');
      } else {
        router.push('/auth/login');
      }
    } else if (hasStaffRedirectFlag && !loading) {
      console.log('[DashboardLayout] Found staff redirect flag');
      sessionStorage.removeItem('redirectToStaffDashboard');
      // No need to redirect, component should be visible now
    }
  }, [user, loading, router, pathname]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="size-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
        <p className="mt-6 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Navigation links based on user role
  const navLinks = [
    {
      name: 'Home',
      href: '/?from=dashboard',
      icon: Home,
    },
    {
      name: 'Dashboard',
      href: `/dashboard/${userRole?.toLowerCase()}`,
      icon: HeartPulse,
    },
    {
      name: 'Appointments',
      href: '/appointments',
      icon: CalendarDays,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
    },
  ];

  // Additional links based on user role
  if (userRole === 'Doctor' || userRole === 'Staff' || userRole === 'Admin') {
    navLinks.push({
      name: 'Patients',
      href: '/patients',
      icon: Users,
    });
  }

  if (userRole === 'Admin') {
    navLinks.push({
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    });
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border/60 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-64 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="h-16 px-4 border-b border-border/60 flex items-center justify-between">
            <Link href="/?from=dashboard" className="flex items-center gap-2">
              <HeartPulse className="h-7 w-7 text-primary" />
              <span className="font-medium">Java Medical</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center px-3 py-2.5 rounded-md text-sm group transition-colors ${
                  pathname === link.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <link.icon
                  className={`mr-3 h-5 w-5 ${
                    pathname === link.href
                      ? 'text-primary'
                      : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                />
                {link.name}
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-border/60">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="font-medium truncate">
                  {user?.displayName || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {userRole || 'User'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <header className="h-16 border-b border-border/60 px-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="relative rounded-md w-64 md:w-80 hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search..."
                className="w-full py-2 pl-9 pr-4 bg-muted/50 rounded-md border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 size-2 bg-primary rounded-full"></span>
            </Button>
            <Button variant="ghost" size="icon">
              <Mail className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
