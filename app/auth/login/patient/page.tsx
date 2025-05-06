'use client';

import { useState, useEffect } from 'react'; // Import useEffect
import { useRouter } from 'next/navigation'; // Import useRouter
import Link from 'next/link';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Heart,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  UserCircle,
  Info, // Import Info icon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { loginUser } from '@/app/firebase/auth';
import { useAuth } from '@/app/contexts/AuthContext'; // Import useAuth

// Define form schema
const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
});

export default function PatientLoginPage() {
  const router = useRouter(); // Initialize router
  const { user, loading, accessDeniedReason } = useAuth(); // Get user and loading state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null); // State for context error

  // Update authError when accessDeniedReason changes
  useEffect(() => {
    setAuthError(accessDeniedReason);
  }, [accessDeniedReason]);

  // <<< --- ADDED EFFECT FOR REDIRECTION --- >>>
  useEffect(() => {
    // Redirect to patient dashboard if user logs in successfully while on this page
    console.log('[PatientLoginPage] Auth state check:', {
      loading,
      user: !!user,
    });
    if (!loading && user) {
      console.log(
        '[PatientLoginPage] User detected, redirecting to /dashboard/patient...'
      );
      router.push('/dashboard/patient');
    }
    // No need to handle the !user case here, as the user should stay on the login page if not logged in.
  }, [user, loading, router]);
  // <<< --- END OF ADDED EFFECT --- >>>

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null); // Clear local form error
    setAuthError(null); // Clear auth context error on new attempt

    try {
      const result = await loginUser(values.email, values.password);

      // NOTE: The AuthContext now handles the redirection and access denial.
      // This onSubmit primarily attempts the login via Firebase.
      // If successful, AuthContext listener will pick it up, verify status/email,
      // and either grant access (triggering redirect via DashboardLayout)
      // or set accessDeniedReason (which will be displayed).

      if (!result.success) {
        // Handle specific Firebase login errors (wrong password, user not found)
        setError('Invalid email or password. Please try again.');
      }
      // No explicit redirect here; AuthContext handles it based on verification/status
      // If login is successful but verification/status fails, AuthContext sets
      // accessDeniedReason, and the user stays on the login page to see the message.
    } catch (err) {
      setError('An unexpected error occurred during login.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      form.handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent/5 via-background to-background px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-5xl min-w-[350px] min-h-[600px] border shadow-xl rounded-3xl overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left Column - Illustration & Welcome */}
          <div className="hidden lg:flex lg:w-5/12 bg-accent/10 p-12 flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent" />
            <div className="relative z-10">
              <Heart className="h-12 w-12 text-accent mb-8" />
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Welcome Back
              </h2>
              <p className="text-muted-foreground text-lg">
                Access your patient portal to manage appointments, view medical
                records, and stay connected with your healthcare team.
              </p>
            </div>
            <div className="relative z-10 space-y-4">
              <p className="text-sm text-muted-foreground/80">
                &ldquo;The greatest wealth is health.&rdquo;
              </p>
              <p className="text-sm font-medium text-foreground">- Virgil</p>
            </div>
          </div>

          {/* Right Column - Login Form */}
          <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center">
            <div className="w-full max-w-md mx-auto">
              <CardHeader className="space-y-1 p-0 mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <UserCircle className="h-8 w-8 text-accent" />
                  <CardTitle className="text-2xl font-bold">
                    Patient Login
                  </CardTitle>
                </div>
                <CardDescription className="text-base text-muted-foreground">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                {/* Display Auth Context Error (Verification/Status) */}
                {authError && (
                  <div
                    className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2"
                    role="alert"
                  >
                    <Info className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">{authError}</span>
                  </div>
                )}
                {/* Display Local Form Error (Invalid Credentials) */}
                {error &&
                  !authError && ( // Show only if no authError
                    <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                    onKeyDown={handleKeyDown}
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                              <Input
                                placeholder="name@example.com"
                                type="email"
                                autoComplete="email"
                                className="pl-10 py-2 text-base bg-background border-border"
                                {...field}
                                disabled={isLoading}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                              <Input
                                type="password"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                className="pl-10 py-2 text-base bg-background border-border"
                                {...field}
                                disabled={isLoading}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-center justify-between">
                      <Link
                        href="/auth/password-reset"
                        className="text-sm text-accent hover:text-accent/80 transition-colors"
                        tabIndex={0}
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Button
                      type="submit"
                      className="w-full py-2 text-base rounded-lg"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 border-t mt-8 pt-6 p-0">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <Link
                      href="/auth/register/patient"
                      className="text-accent hover:text-accent/80 transition-colors font-medium"
                      tabIndex={0}
                    >
                      Register
                    </Link>
                  </p>
                </div>
                <div className="text-center">
                  <Link
                    href="/auth/login"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={0}
                  >
                    Back to login options
                  </Link>
                </div>
              </CardFooter>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
