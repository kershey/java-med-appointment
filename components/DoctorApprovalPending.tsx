'use client';

import { useRouter } from 'next/navigation';
import { ClipboardList, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DoctorApprovalPendingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DoctorApprovalPending({
  open,
  onOpenChange,
}: DoctorApprovalPendingProps) {
  const router = useRouter();

  const handleBackToLogin = () => {
    onOpenChange(false);
    router.push('/auth/login');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <AlertCircle className="h-8 w-8 text-amber-600" />
          </div>
          <DialogTitle className="text-xl text-center pt-4">
            Account Approval Pending
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            This account needs to be approved by an administrator before you can
            log in.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 p-4 bg-muted/20 rounded-lg">
          <div className="flex items-start gap-3">
            <ClipboardList className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">
                What happens next?
              </p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>
                  Your registration has been submitted to our administrative
                  team.
                </li>
                <li>
                  They will review your credentials and professional
                  information.
                </li>
                <li>
                  Once approved, you&apos;ll be notified by email and able to
                  log in to the system.
                </li>
              </ol>
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between">
          <Button variant="outline" onClick={handleBackToLogin}>
            Back to Login Options
          </Button>
          <Button variant="default" onClick={() => onOpenChange(false)}>
            OK, I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
