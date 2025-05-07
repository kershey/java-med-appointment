import DashboardLayout from '../dashboard/layout';

export default function AppointmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
