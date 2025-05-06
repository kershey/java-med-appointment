import { format, isPast as isDatePast, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle2,
  User,
  CalendarX,
  CircleAlert,
} from 'lucide-react';
import Link from 'next/link';

type AppointmentStatus = 'confirmed' | 'pending' | 'canceled' | 'completed';

export interface Appointment {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  date: Date;
  time: string;
  location: string;
  status: AppointmentStatus;
}

export interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: (id: string) => void;
  onReschedule?: (id: string) => void;
  isPast?: boolean;
}

export function AppointmentCard({
  appointment,
  onCancel,
  onReschedule,
  isPast,
}: AppointmentCardProps) {
  const { id, doctorName, doctorSpecialty, date, time, location, status } =
    appointment;
  const isPastAppointment = isPast || (isDatePast(date) && !isToday(date));

  // Status indicator styles
  const statusConfig = {
    confirmed: {
      colorClass: 'bg-primary/10 text-primary',
      icon: CheckCircle2,
      text: 'Confirmed',
    },
    pending: {
      colorClass: 'bg-amber-500/10 text-amber-500',
      icon: CircleAlert,
      text: 'Pending',
    },
    canceled: {
      colorClass: 'bg-destructive/10 text-destructive',
      icon: CalendarX,
      text: 'Canceled',
    },
    completed: {
      colorClass: 'bg-accent/10 text-accent',
      icon: CheckCircle2,
      text: 'Completed',
    },
  };

  const StatusIcon = statusConfig[status].icon;

  return (
    <div className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Status Bar */}
      <div
        className={`py-1.5 px-4 ${statusConfig[status].colorClass} flex items-center justify-between`}
      >
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <StatusIcon className="h-4 w-4" />
          <span>{statusConfig[status].text}</span>
        </div>
        {isToday(date) && !isPastAppointment && status === 'confirmed' && (
          <span className="text-xs font-medium bg-white/20 py-0.5 px-2 rounded-full">
            Today
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4">
        {/* Provider Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-medium leading-snug">{doctorName}</h3>
            <p className="text-sm text-muted-foreground">{doctorSpecialty}</p>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="space-y-2.5 mb-4">
          <div className="flex items-center gap-2.5 text-sm">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span>{format(date, 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{time}</span>
          </div>
          <div className="flex items-start gap-2.5 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <span>{location}</span>
          </div>
        </div>

        {/* Actions */}
        {!isPastAppointment &&
          status !== 'canceled' &&
          status !== 'completed' && (
            <div className="flex gap-2 mt-4">
              {onReschedule && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onReschedule(id)}
                >
                  Reschedule
                </Button>
              )}
              {onCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onCancel(id)}
                >
                  Cancel
                </Button>
              )}
            </div>
          )}

        {/* Details Link */}
        <div className="mt-3 text-right">
          <Link
            href={`/appointments/${id}`}
            className="text-xs text-primary font-medium hover:underline"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
