'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ComboboxDemo } from '../components/ui-custom/ComboboxSpecialization';
import {
  getAllActiveDoctors,
  getDoctorsBySpecialization,
  DoctorWithUserInfo,
} from '@/app/firebase/doctors';

const specializations = [
  'General Medicine',
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Dermatology',
  'Orthopedics',
  'Ophthalmology',
  'Gynecology',
  'ENT',
  'Psychiatry',
  'Dentistry',
  'All',
];

export default function DoctorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');
  const [doctors, setDoctors] = useState<DoctorWithUserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);

        if (selectedSpecialization !== 'All') {
          const result = await getDoctorsBySpecialization(
            selectedSpecialization
          );
          if (result.success && result.doctors) {
            setDoctors(result.doctors);
          } else {
            console.error(
              'Error fetching doctors by specialization:',
              result.error
            );
            setDoctors([]);
          }
        } else {
          const result = await getAllActiveDoctors();
          if (result.success && result.doctors) {
            setDoctors(result.doctors);
          } else {
            console.error('Error fetching all doctors:', result.error);
            setDoctors([]);
          }
        }
      } catch (error) {
        console.error('Error in fetchDoctors:', error);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [selectedSpecialization]);

  const handleSpecializationChange = (value: string) => {
    setSelectedSpecialization(value);
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.userInfo?.fullName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      doctor.specializations.some((spec) =>
        spec.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesSearch;
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Find a Doctor</h1>

      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-full md:w-64">
            <ComboboxDemo
              options={specializations}
              value={selectedSpecialization}
              onChange={handleSpecializationChange}
              placeholder="Filter by Specialization"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="size-16 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto"></div>
          <p className="ml-4">Loading doctors...</p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-lg">
          <p className="text-gray-500">
            No doctors found matching your criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <Card
              key={doctor.uid}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage
                      src={doctor.userInfo?.profileImage}
                      alt={doctor.userInfo?.fullName || 'Doctor'}
                    />
                    <AvatarFallback>
                      {doctor.userInfo?.fullName
                        ?.split(' ')
                        .map((name) => name.charAt(0))
                        .join('')
                        .substring(0, 2) || 'DR'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">
                      {doctor.userInfo?.fullName}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      ₱{doctor.consultationFee.toFixed(2)} per consultation
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="mb-3">
                  <p className="text-sm font-medium mb-1">Specializations:</p>
                  <div className="flex flex-wrap gap-1">
                    {doctor.specializations.map((spec, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-blue-50"
                      >
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium mb-1">Clinic Address:</p>
                  <p className="text-sm text-gray-600">
                    {doctor.clinicAddress}
                  </p>
                </div>

                {doctor.bio && (
                  <div>
                    <p className="text-sm font-medium mb-1">About:</p>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {doctor.bio}
                    </p>
                  </div>
                )}
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => router.push(`/doctors/${doctor.uid}`)}
                >
                  View Profile
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
