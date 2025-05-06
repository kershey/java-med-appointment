'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  ShieldCheck,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  Settings,
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

// Define form schema
const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
});

export default function AdminLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    console.log('Admin login attempt:', values.email);

    try {
      const result = await loginUser(values.email, values.password);
      console.log('Login result:', result);

      if (result.success) {
        // Check if user is an admin
        if (result.userType === 'Admin') {
          console.log('Admin login successful, userStatus:', result.status);

          // Check email verification and account status
          if (!result.user?.emailVerified) {
            setError(
              'Please verify your email before logging in. Check your inbox for a verification link.'
            );
            return;
          }

          if (result.status !== 'Active') {
            setError(
              `Your account status is "${result.status}". Please contact support for assistance.`
            );
            return;
          }

          console.log('All checks passed, redirecting to dashboard');
          // Use replace instead of push for a complete navigation
          router.replace('/dashboard/admin');
          // Add a fallback redirect in case the router doesn't trigger
          setTimeout(() => {
            window.location.href = '/dashboard/admin';
          }, 1000);
        } else {
          console.log(
            'Non-admin tried to access admin login:',
            result.userType
          );
          setError(
            'This login is only for administrators. Please use the appropriate login page.'
          );
        }
      } else {
        console.log('Login failed:', result.error);
        setError('Invalid email or password. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again later.');
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
              <Settings className="h-12 w-12 text-accent mb-8" />
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Welcome Back, Admin
              </h2>
              <p className="text-muted-foreground text-lg">
                Access your administrative dashboard to manage clinic operations
                and system settings.
              </p>
            </div>
            <div className="relative z-10 space-y-4">
              <p className="text-sm text-muted-foreground/80">
                &ldquo;Management is doing things right; leadership is doing the
                right things.&rdquo;
              </p>
              <p className="text-sm font-medium text-foreground">
                - Peter F. Drucker
              </p>
            </div>
          </div>

          {/* Right Column - Login Form */}
          <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center">
            <div className="w-full max-w-md mx-auto">
              <CardHeader className="space-y-1 p-0 mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="h-8 w-8 text-accent" />
                  <CardTitle className="text-2xl font-bold">
                    Admin Login
                  </CardTitle>
                </div>
                <CardDescription className="text-base text-muted-foreground">
                  Enter your credentials to access the system
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                {error && (
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
                      href="/auth/register/admin"
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
