import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Java Medical Clinic - Authentication',
  description: 'Login, register or reset your password for Java Medical Clinic',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="absolute top-0 left-0 w-full p-4 flex justify-center md:justify-start">
        <div className="text-blue-600 font-bold text-2xl md:ml-8">
          Java Medical Clinic
        </div>
      </div>
      {children}
    </div>
  );
}
