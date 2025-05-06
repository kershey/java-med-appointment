'use client';

import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/app/firebase/config';

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
import { ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';

// Define form schema
const formSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z
    .string()
    .min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
});

export default function AdminSetupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    console.log(
      'Starting direct admin creation with values:',
      JSON.stringify({
        ...values,
        password: '[REDACTED]',
      })
    );

    try {
      // Create user in Firebase Auth
      console.log('Creating Firebase Auth user...');
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      const user = userCredential.user;
      console.log('User created in Firebase Auth, UID:', user.uid);

      // Format full name
      const fullName = `${values.firstName} ${values.lastName}`;

      // Update profile display name
      console.log('Updating profile display name...');
      await updateProfile(user, {
        displayName: fullName,
      });

      // Send email verification
      console.log('Sending email verification...');
      await sendEmailVerification(user);

      // Create user document in Firestore with Active status
      console.log('Creating user document in Firestore...');
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: values.email,
        fullName,
        firstName: values.firstName,
        lastName: values.lastName,
        middleName: '',
        gender: '',
        birthDate: null,
        address: '',
        contactNumber: '',
        userType: 'Admin', // Admin role
        status: 'Active', // Set as Active immediately
        profileImage: '',
        isVerified: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('Admin user created successfully!');
      setSuccess(
        'Admin created successfully! You can now log in using these credentials.'
      );
      form.reset();
    } catch (err) {
      console.error('Error creating admin:', err);

      if (err instanceof Error) {
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);

        if (err.message?.includes('email-already-in-use')) {
          setError(
            'Email already in use. Please try a different email address.'
          );
        } else {
          setError(`An error occurred: ${err.message}`);
        }
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent/5 via-background to-background p-4">
      <Card className="w-full max-w-md border shadow-xl rounded-xl overflow-hidden">
        <CardHeader className="space-y-1 p-6">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-6 w-6 text-accent" />
            <CardTitle className="text-2xl font-bold">Admin Setup</CardTitle>
          </div>
          <CardDescription className="text-base text-muted-foreground">
            Create an administrator account with active status
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John"
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="admin@example.com"
                        type="email"
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="******"
                        type="password"
                        {...field}
                        disabled={isLoading}
                        className="bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full mt-2"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Admin User'}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="bg-muted/10 p-6 border-t">
          <p className="text-sm text-muted-foreground">
            This page creates an administrator account with active status. Use
            this only for initial setup.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
