'use client';

import Link from 'next/link';
import {
  HeartPulse,
  User,
  Stethoscope,
  ArrowRight,
  Users,
  ShieldCheck,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function RegisterOptionsPage() {
  return (
    <div className="max-w-md w-full">
      <Card className="border shadow-lg rounded-xl overflow-hidden">
        {/* Brand header */}
        <div className="bg-primary/5 p-6 flex justify-center border-b">
          <HeartPulse className="h-12 w-12 text-primary" />
        </div>

        <CardHeader className="text-center pt-6 pb-2">
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription className="text-muted-foreground">
            Please select your account type to register
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 p-6">
          <Button
            variant="outline"
            className="w-full justify-start h-14 text-base hover:bg-primary/5 hover:border-primary/20 group"
            asChild
          >
            <Link href="/auth/register/patient">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 group-hover:bg-primary/20 transition-colors">
                <User className="size-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium">Patient</p>
                <p className="text-xs text-muted-foreground">
                  Book appointments & access health records
                </p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-14 text-base hover:bg-accent/5 hover:border-accent/20 group"
            asChild
          >
            <Link href="/auth/register/doctor">
              <div className="size-10 rounded-full bg-accent/10 flex items-center justify-center mr-3 group-hover:bg-accent/20 transition-colors">
                <Stethoscope className="size-5 text-accent" />
              </div>
              <div className="text-left">
                <p className="font-medium">Doctor</p>
                <p className="text-xs text-muted-foreground">
                  Register as a healthcare provider
                </p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
            </Link>
          </Button>
        </CardContent>

        <div className="px-6 pb-2">
          <div className="bg-muted/30 p-4 rounded-lg border border-border/60 text-center">
            <div className="flex justify-center space-x-2 mb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Staff and Administrator accounts can only be created by existing
              administrators.
            </p>
          </div>
        </div>

        <CardFooter className="pb-6 flex justify-center border-t pt-6 bg-secondary/5">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in now
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
