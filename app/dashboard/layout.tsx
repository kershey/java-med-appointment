'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  Users,
  Home,
  User,
  Settings,
  X,
  HeartPulse,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logoutUser } from '@/app/firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userRole, loading, userData } = useAuth();
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
  }, [user, loading, router, pathname, userRole]);

  const handleLogout = async () => {
    await logoutUser();
    const redirectPath =
      userRole?.toLowerCase() === 'patient'
        ? '/auth/login/patient'
        : userRole?.toLowerCase() === 'doctor'
        ? '/auth/login/doctor'
        : userRole?.toLowerCase() === 'staff'
        ? '/auth/login/staff'
        : userRole?.toLowerCase() === 'admin'
        ? '/auth/login/admin'
        : '/auth/login';

    router.push(redirectPath);
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
  ];

  // Role-specific links
  if (userRole === 'Doctor') {
    navLinks.push({
      name: 'My Profile',
      href: '/dashboard/doctor/profile',
      icon: User,
    });
  } else {
    // For other roles (Patient, Staff, Admin)
    navLinks.push({
      name: 'Profile',
      href: '/profile',
      icon: User,
    });
  }

  // Additional links based on user role
  if (userRole === 'Staff') {
    navLinks.push({
      name: 'User Management',
      href: '/dashboard/staff/users',
      icon: Users,
    });
  }

  if (userRole === 'Admin') {
    navLinks.push(
      {
        name: 'User Management',
        href: '/dashboard/admin/users',
        icon: Users,
      },
      {
        name: 'Doctor Management',
        href: '/dashboard/admin/doctors',
        icon: HeartPulse,
      }
    );
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
                {link.icon && <link.icon className="mr-3 h-5 w-5" />}
                {link.name}
              </Link>
            ))}
          </nav>

          {/* User Profile Dropdown */}
          <div className="mt-auto px-3 py-4 border-t border-border/60">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors outline-none">
                  <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-medium">
                    {userData?.firstName?.charAt(0)?.toUpperCase() ||
                      user?.email?.charAt(0)?.toUpperCase() ||
                      'U'}
                  </div>
                  <div className="overflow-hidden text-left flex-1">
                    <p className="text-sm font-medium truncate">
                      {userData?.firstName
                        ? `${userData.firstName} ${userData.lastName || ''}`
                        : user?.email || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email || ''}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  My Account
                  {userRole && (
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {userRole}
                    </span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href={
                      userRole === 'Doctor'
                        ? '/dashboard/doctor/profile'
                        : '/profile'
                    }
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/appointments">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    <span>Appointments</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 space-y-4">{children}</main>
    </div>
  );
}
