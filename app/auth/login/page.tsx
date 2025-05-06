'use client';

import Link from 'next/link';
import {
  HeartPulse,
  User,
  Stethoscope,
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

export default function LoginOptionsPage() {
  return (
    <div className="max-w-md w-full">
      <Card className="border shadow-lg rounded-xl overflow-hidden">
        {/* Brand header */}
        <div className="bg-primary/5 p-6 flex justify-center border-b">
          <HeartPulse className="h-12 w-12 text-primary" />
        </div>

        <CardHeader className="text-center pt-6 pb-2">
          <CardTitle className="text-2xl">Welcome to Java Medical</CardTitle>
          <CardDescription className="text-muted-foreground">
            Please select your account type to continue
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 p-6">
          <Button
            variant="outline"
            className="w-full justify-start h-14 text-base hover:bg-primary/5 hover:border-primary/20 group"
            asChild
          >
            <Link href="/auth/login/patient">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 group-hover:bg-primary/20 transition-colors">
                <User className="size-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium">Patient</p>
                <p className="text-xs text-muted-foreground">
                  Book appointments & access health records
                </p>
              </div>
            </Link>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-14 text-base hover:bg-accent/5 hover:border-accent/20 group"
            asChild
          >
            <Link href="/auth/login/doctor">
              <div className="size-10 rounded-full bg-accent/10 flex items-center justify-center mr-3 group-hover:bg-accent/20 transition-colors">
                <Stethoscope className="size-5 text-accent" />
              </div>
              <div className="text-left">
                <p className="font-medium">Doctor</p>
                <p className="text-xs text-muted-foreground">
                  Manage appointments & patient care
                </p>
              </div>
            </Link>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-14 text-base hover:bg-secondary-foreground/5 hover:border-secondary-foreground/20 group"
            asChild
          >
            <Link href="/auth/login/staff">
              <div className="size-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center mr-3 group-hover:bg-secondary-foreground/20 transition-colors">
                <Users className="size-5 text-secondary-foreground" />
              </div>
              <div className="text-left">
                <p className="font-medium">Staff</p>
                <p className="text-xs text-muted-foreground">
                  Coordinate patient services & scheduling
                </p>
              </div>
            </Link>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-14 text-base hover:bg-foreground/5 hover:border-foreground/20 group"
            asChild
          >
            <Link href="/auth/login/admin">
              <div className="size-10 rounded-full bg-foreground/10 flex items-center justify-center mr-3 group-hover:bg-foreground/20 transition-colors">
                <ShieldCheck className="size-5 text-foreground" />
              </div>
              <div className="text-left">
                <p className="font-medium">Administrator</p>
                <p className="text-xs text-muted-foreground">
                  Manage system settings & user access
                </p>
              </div>
            </Link>
          </Button>
        </CardContent>

        <CardFooter className="pb-6 flex justify-center border-t pt-6 bg-secondary/5">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              href="/auth/register"
              className="text-primary hover:underline font-medium"
            >
              Create one now
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
