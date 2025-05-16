'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  Database,
  RefreshCw,
} from 'lucide-react';

export default function AdminToolsPage() {
  const router = useRouter();
  const { user, userData, userRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
  }>({});

  // Redirect to login if not admin
  if (!loading && (!user || userRole !== 'Admin')) {
    router.push('/auth/login');
    return null;
  }

  const handleSyncDoctorNames = async () => {
    if (!user || !userData) return;

    setLoading(true);
    setResult({});

    try {
      // Get the admin API key from environment variables or use a secure way to retrieve it
      const adminKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'admin-key'; // Not secure, just for demo

      const response = await fetch('/api/admin/sync-doctor-names', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          adminKey,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message:
            data.message ||
            `Synced ${data.updated} doctor records successfully`,
        });
      } else {
        setResult({
          success: false,
          error: data.error || 'Failed to sync doctor names',
        });
      }
    } catch (error) {
      console.error('Error syncing doctor names:', error);
      setResult({
        success: false,
        error: 'An unexpected error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Tools</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Doctor Name Sync</CardTitle>
            <CardDescription>
              Synchronize doctor names from user profiles to doctor documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This tool will copy the fullName field from all user documents to
              their corresponding doctor documents for all doctors in the
              system. This helps ensure consistent doctor name display
              throughout the application.
            </p>

            {result.success && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">
                  {result.message}
                </AlertDescription>
              </Alert>
            )}

            {result.error && (
              <Alert
                className="mb-4 bg-red-50 border-red-200"
                variant="destructive"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{result.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSyncDoctorNames}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Sync Doctor Names
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Add more admin tools cards here as needed */}
      </div>
    </div>
  );
}
