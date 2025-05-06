'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
  Briefcase,
  PenLine,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { registerUser } from '@/app/firebase/auth';

// Define form schema
const formSchema = z
  .object({
    firstName: z
      .string()
      .min(2, { message: 'First name must be at least 2 characters' }),
    middleName: z.string().optional(),
    lastName: z
      .string()
      .min(2, { message: 'Last name must be at least 2 characters' }),
    gender: z.string().optional(),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    contactNumber: z.string().optional(),
    role: z.string({
      required_error: 'Please select your role',
    }),
    bio: z.string().optional(),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z
      .string()
      .min(6, { message: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function AdminRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      gender: '',
      email: '',
      contactNumber: '',
      role: '',
      bio: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    console.log(
      'Starting admin registration with values:',
      JSON.stringify({
        ...values,
        password: '[REDACTED]',
        confirmPassword: '[REDACTED]',
      })
    );

    try {
      console.log('Calling registerUser function...');
      const result = await registerUser({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        middleName: values.middleName,
        userType: 'Admin',
        additionalData: {
          gender: values.gender,
          contactNumber: values.contactNumber,
          role: values.role,
          bio: values.bio,
        },
      });

      console.log('Registration result:', result);

      if (result.success) {
        console.log('Registration successful, setting success message');
        setSuccess(
          'Registration successful! Your application will be reviewed by an existing administrator. Please check your email for verification.'
        );
        setTimeout(() => {
          router.push('/auth/login/admin');
        }, 5000);
      } else {
        console.error('Registration failed with error:', result.error);
        if (
          result.error &&
          typeof result.error === 'object' &&
          'code' in result.error
        ) {
          const errorCode = (result.error as { code?: string }).code;

          // Handle specific Firebase error codes
          if (errorCode === 'auth/email-already-in-use') {
            setError(
              'Email already in use. Please try a different email address.'
            );
          } else if (errorCode === 'auth/invalid-email') {
            setError('Invalid email format. Please check your email address.');
          } else if (errorCode === 'auth/weak-password') {
            setError(
              'Password is too weak. Please choose a stronger password.'
            );
          } else if (errorCode === 'auth/network-request-failed') {
            setError(
              'Network error. Please check your internet connection and try again.'
            );
          } else {
            setError(`Registration failed: ${errorCode}. Please try again.`);
          }
        } else {
          setError('Registration failed. Please try again.');
        }
      }
    } catch (err: unknown) {
      console.error('Registration error:', err);

      // Try to extract detailed error information
      if (err instanceof Error) {
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);

        if (err.message?.includes('email-already-in-use')) {
          setError(
            'Email already in use. Please try a different email address.'
          );
        } else if (err.message?.includes('invalid-email')) {
          setError('Invalid email format. Please check your email address.');
        } else if (err.message?.includes('weak-password')) {
          setError('Password is too weak. Please choose a stronger password.');
        } else if (err.message?.includes('network-request-failed')) {
          setError(
            'Network error. Please check your internet connection and try again.'
          );
        } else {
          setError(
            `An error occurred: ${err.message}. Please try again later.`
          );
        }
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
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
    <div className="max-w-lg w-full">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          <Link href="/auth/register">
            <ArrowLeft className="h-4 w-4" />
            Back to account types
          </Link>
        </Button>
      </div>

      <Card className="border shadow-md rounded-xl overflow-hidden">
        <CardHeader className="space-y-1 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-accent" />
            </div>
            <CardTitle className="text-2xl">
              Administrator Registration
            </CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            Create your administrator account to manage the clinic system
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-accent/10 text-accent px-4 py-3 rounded-md mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              onKeyDown={handleKeyDown}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John"
                          aria-label="First Name"
                          autoComplete="given-name"
                          {...field}
                          disabled={isLoading}
                          className="bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="middleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Middle Name (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Middle"
                          aria-label="Middle Name"
                          autoComplete="additional-name"
                          {...field}
                          disabled={isLoading}
                          className="bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Doe"
                          aria-label="Last Name"
                          autoComplete="family-name"
                          {...field}
                          disabled={isLoading}
                          className="bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                          <SelectItem value="Prefer not to say">
                            Prefer not to say
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="(123) 456-7890"
                            aria-label="Contact Number"
                            autoComplete="tel"
                            className="pl-10 bg-background"
                            {...field}
                            disabled={isLoading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="johndoe@example.com"
                          aria-label="Email"
                          autoComplete="email"
                          type="email"
                          className="pl-10 bg-background"
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
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Administrative Role</FormLabel>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="pl-10 bg-background">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="System Administrator">
                            System Administrator
                          </SelectItem>
                          <SelectItem value="Clinic Manager">
                            Clinic Manager
                          </SelectItem>
                          <SelectItem value="IT Administrator">
                            IT Administrator
                          </SelectItem>
                          <SelectItem value="Operations Manager">
                            Operations Manager
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Bio (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <PenLine className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea
                          placeholder="Tell us about your professional experience, education, and expertise..."
                          className="min-h-32 resize-none pl-10 bg-background"
                          {...field}
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••"
                          aria-label="Password"
                          autoComplete="new-password"
                          className="bg-background"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••"
                          aria-label="Confirm Password"
                          autoComplete="new-password"
                          className="bg-background"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="border-t pt-6 flex flex-col space-y-4 bg-secondary/5">
          <p className="text-sm text-muted-foreground text-center">
            All administrator registrations require approval from an existing
            administrator
          </p>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/auth/login/admin"
                className="text-accent hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
