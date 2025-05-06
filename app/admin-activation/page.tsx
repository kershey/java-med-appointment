'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserStatus } from '../firebase/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminActivation() {
  const { user, userData, userRole } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activateAdmin = async () => {
    if (!user?.uid) {
      setError('You must be logged in to activate your account');
      return;
    }

    if (userRole !== 'Admin') {
      setError('Only admin accounts can be activated with this tool');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await updateUserStatus(user.uid, 'Active');

      if (result.success) {
        setSuccess(true);
      } else {
        setError('Failed to activate account. Please try again.');
      }
    } catch (err) {
      console.error('Activation error:', err);
      setError('An error occurred during activation');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent/5 via-background to-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-accent" />
              Admin Activation
            </CardTitle>
            <CardDescription>
              You need to be logged in to activate your admin account
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/auth/login/admin')}
              className="w-full"
            >
              Go to Admin Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent/5 via-background to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-accent" />
            Admin Account Activation
          </CardTitle>
          <CardDescription>
            Activate your admin account to access the dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success ? (
            <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">
                Your admin account has been activated! You can now log in to
                access the dashboard.
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              <p>
                Current status:{' '}
                <span className="font-medium">
                  {userData?.status || 'Unknown'}
                </span>
              </p>
              <p>
                User role:{' '}
                <span className="font-medium">{userRole || 'Unknown'}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Click the button below to change your account status from
                &ldquo;Inactive&rdquo; to &ldquo;Active&rdquo;
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-4 flex-col sm:flex-row">
          {success ? (
            <Button
              className="w-full"
              onClick={() => (window.location.href = '/auth/login/admin')}
            >
              Go to Login
            </Button>
          ) : (
            <>
              <Button
                onClick={activateAdmin}
                className="w-full"
                disabled={isLoading || success}
              >
                {isLoading ? 'Activating...' : 'Activate Account'}
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/auth/login/admin')}
                className="w-full"
              >
                Back to Login
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
