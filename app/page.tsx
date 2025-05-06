'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from './contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  CalendarDays,
  Users,
  ClipboardCheck,
  ActivitySquare,
  HeartPulse,
  BadgeCheck,
} from 'lucide-react';

export default function Home() {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromDashboard = searchParams.get('from') === 'dashboard';

  useEffect(() => {
    console.log('[app/page.tsx] useEffect triggered. State:', {
      loading,
      user: !!user,
      userRole,
      fromDashboard,
    });

    // Only redirect if the user is authenticated AND not intentionally navigating from dashboard
    if (!loading && user && !fromDashboard) {
      // Redirect based on user role
      console.log(
        `[app/page.tsx] Condition met: !loading && user && !fromDashboard. Role: ${userRole}`
      );
      switch (userRole) {
        case 'Patient':
          console.log(
            '[app/page.tsx] Attempting redirect to /dashboard/patient'
          );
          router.push('/dashboard/patient');
          break;
        case 'Doctor':
          console.log(
            '[app/page.tsx] Attempting redirect to /dashboard/doctor'
          );
          router.push('/dashboard/doctor');
          break;
        case 'Staff':
          console.log('[app/page.tsx] Attempting redirect to /dashboard/staff');
          router.push('/dashboard/staff');
          break;
        case 'Admin':
          console.log('[app/page.tsx] Attempting redirect to /dashboard/admin');
          router.push('/dashboard/admin');
          break;
        default:
          // If no role or unknown role, redirect to login
          console.log(
            '[app/page.tsx] Unknown role or fallback, redirecting to /auth/login'
          );
          router.push('/auth/login');
      }
    } else if (!loading && !user) {
      console.log(
        '[app/page.tsx] Condition met: !loading && !user. Staying on landing page.'
      );
    } else if (!loading && user && fromDashboard) {
      console.log(
        '[app/page.tsx] User is authenticated and coming from dashboard. Showing home page.'
      );
    } else {
      console.log('[app/page.tsx] Condition not met: loading is true.');
    }
  }, [user, userRole, loading, router, fromDashboard]);

  // If still loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="size-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
        <p className="mt-6 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // If not logged in, show the landing page
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-background to-secondary/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <HeartPulse className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-medium">Java Medical</span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <a
                href="#features"
                className="text-foreground/70 hover:text-primary px-3 py-2 text-sm"
              >
                Features
              </a>
              <a
                href="#doctors"
                className="text-foreground/70 hover:text-primary px-3 py-2 text-sm"
              >
                Doctors
              </a>
              <a
                href="#testimonials"
                className="text-foreground/70 hover:text-primary px-3 py-2 text-sm"
              >
                Testimonials
              </a>
            </div>
            <div className="flex items-center gap-3">
              {!user ? (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/auth/register">Register</Link>
                  </Button>
                </>
              ) : (
                <Button asChild size="sm">
                  <Link href={`/dashboard/${userRole?.toLowerCase()}`}>
                    Dashboard
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12 py-12">
          <div className="flex-1 space-y-8">
            <div>
              <p className="text-primary font-medium mb-2">
                Your Health, Our Priority
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-4">
                Modern Healthcare for a{' '}
                <span className="text-primary">Better Tomorrow</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Experience seamless appointment booking, personalized care, and
                cutting-edge medical services all in one place.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {!user ? (
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/auth/register">Book Appointment</Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/appointments/new">Book Appointment</Link>
                </Button>
              )}
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                <Link href="#features">Learn More</Link>
              </Button>
            </div>

            <div className="flex items-center gap-6 pt-6">
              <div className="flex -space-x-2">
                <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center border-2 border-background">
                  <BadgeCheck className="size-5 text-primary" />
                </div>
                <div className="size-10 rounded-full bg-accent/20 flex items-center justify-center border-2 border-background">
                  <BadgeCheck className="size-5 text-accent" />
                </div>
                <div className="size-10 rounded-full bg-muted flex items-center justify-center border-2 border-background">
                  <BadgeCheck className="size-5 text-muted-foreground" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Trusted by{' '}
                <span className="font-medium text-foreground">5,000+</span>{' '}
                patients
              </p>
            </div>
          </div>

          <div className="flex-1 relative">
            <div className="rounded-2xl overflow-hidden aspect-video bg-primary/10 relative">
              <div className="absolute inset-0 flex items-center justify-center text-primary">
                {/* This would be an image in production */}
                <ActivitySquare className="size-16" strokeWidth={1.5} />
              </div>
            </div>
            {/* Floating accent elements */}
            <div className="absolute -top-4 -right-4 size-24 rounded-full bg-accent/10 -z-10"></div>
            <div className="absolute -bottom-6 -left-6 size-32 rounded-full bg-primary/10 -z-10"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl font-medium mb-4">
            World-Class Healthcare Services
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our comprehensive platform connects patients with top specialists
            and simplifies healthcare management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card rounded-xl p-6 shadow-sm border hover:shadow-md transition-all">
            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <CalendarDays className="size-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Easy Scheduling</h3>
            <p className="text-muted-foreground">
              Book appointments online 24/7, reschedule with a click, and
              receive automated reminders.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border hover:shadow-md transition-all">
            <div className="size-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <Users className="size-6 text-accent" />
            </div>
            <h3 className="text-xl font-medium mb-2">Top Specialists</h3>
            <p className="text-muted-foreground">
              Connect with highly qualified doctors across multiple specialties
              and read verified patient reviews.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border hover:shadow-md transition-all">
            <div className="size-12 rounded-lg bg-secondary/70 flex items-center justify-center mb-4">
              <ClipboardCheck className="size-6 text-secondary-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">Digital Records</h3>
            <p className="text-muted-foreground">
              Access your complete medical history, test results, and
              prescriptions securely from any device.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-primary/5 rounded-2xl p-8 md:p-12 border border-primary/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 size-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-medium mb-4 max-w-xl">
              Ready to experience better healthcare?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl">
              Join thousands of satisfied patients who have transformed their
              healthcare experience with Java Medical Clinic.
            </p>

            {!user ? (
              <Button asChild size="lg">
                <Link href="/auth/register">Get Started Today</Link>
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link href={`/dashboard/${userRole?.toLowerCase()}`}>
                  Go to Dashboard
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t mt-auto">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center">
              <HeartPulse className="h-6 w-6 text-primary" />
              <span className="ml-2 text-lg font-medium">Java Medical</span>
            </div>

            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-primary">
                Terms of Service
              </a>
              <a href="#" className="hover:text-primary">
                Contact Us
              </a>
            </div>

            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Java Medical Clinic. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
