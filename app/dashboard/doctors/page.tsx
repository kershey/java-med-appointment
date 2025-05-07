'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  where,
  query,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { DoctorProfile, User, UserStatus } from '@/app/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Search,
  Edit,
  Eye,
  UserCheck,
  UserX,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/app/contexts/AuthContext';

interface DoctorWithUserInfo extends DoctorProfile {
  userInfo?: User;
}

export default function ManageDoctorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState<DoctorWithUserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const { userData } = useAuth();

  // Check if the current user is staff or admin
  const isAuthorized =
    userData?.userType === 'Admin' || userData?.userType === 'Staff';

  useEffect(() => {
    if (!isAuthorized) {
      router.push('/dashboard');
      return;
    }

    // Fetch doctors
    const fetchDoctors = async () => {
      try {
        setLoading(true);

        // Get all users who are doctors
        const usersQuery = query(
          collection(db, 'users'),
          where('userType', '==', 'Doctor')
        );

        // Subscribe to users collection changes
        const unsubscribeUsers = onSnapshot(
          usersQuery,
          async (usersSnapshot) => {
            const userDocs = usersSnapshot.docs.map(
              (doc) =>
                ({
                  ...doc.data(),
                  uid: doc.id,
                } as User)
            );

            // Get doctor profiles for each doctor user
            const doctorsWithInfo: DoctorWithUserInfo[] = [];

            for (const userDoc of userDocs) {
              try {
                // Get doctor profile
                const doctorDoc = await getDocs(
                  query(
                    collection(db, 'doctors'),
                    where('uid', '==', userDoc.uid)
                  )
                );

                if (!doctorDoc.empty) {
                  const doctorData = {
                    ...doctorDoc.docs[0].data(),
                    uid: userDoc.uid,
                  } as DoctorProfile;

                  doctorsWithInfo.push({
                    ...doctorData,
                    userInfo: userDoc,
                  });
                } else {
                  // Doctor profile not found, create an empty one
                  doctorsWithInfo.push({
                    uid: userDoc.uid,
                    specializations: [],
                    clinicAddress: 'Not set',
                    schedule: {},
                    consultationFee: 0,
                    availability: false,
                    profileStatus: 'Pending' as UserStatus,
                    userInfo: userDoc,
                  });
                }
              } catch (error) {
                console.error(
                  `Error fetching doctor profile for ${userDoc.uid}:`,
                  error
                );
              }
            }

            setDoctors(doctorsWithInfo);
            setLoading(false);
          }
        );

        return () => unsubscribeUsers();
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [router, isAuthorized, userData?.userType]);

  const handleStatusChange = async (
    doctorId: string,
    newStatus: UserStatus
  ) => {
    try {
      // Update doctor profile status
      const doctorProfileRef = doc(db, 'doctors', doctorId);

      // Check if doctor profile exists
      const doctorExistsQuery = await getDocs(
        query(collection(db, 'doctors'), where('uid', '==', doctorId))
      );

      if (doctorExistsQuery.empty) {
        // Create a new doctor profile if it doesn't exist
        await setDoc(doctorProfileRef, {
          uid: doctorId,
          specializations: [],
          clinicAddress: 'Not set',
          schedule: {},
          consultationFee: 0,
          availability: false,
          profileStatus: newStatus,
        });
      } else {
        // Update existing doctor profile
        await updateDoc(doctorProfileRef, {
          profileStatus: newStatus,
        });
      }

      // Update user status
      const userDocRef = doc(db, 'users', doctorId);
      await updateDoc(userDocRef, {
        status: newStatus,
      });

      toast({
        title: 'Status Updated',
        description: `Doctor status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update doctor status',
        variant: 'destructive',
      });
    }
  };

  const toggleAvailability = async (
    doctorId: string,
    currentAvailability: boolean
  ) => {
    try {
      // Check if doctor profile exists
      const doctorExistsQuery = await getDocs(
        query(collection(db, 'doctors'), where('uid', '==', doctorId))
      );

      if (doctorExistsQuery.empty) {
        // Create a new doctor profile if it doesn't exist
        await setDoc(doc(db, 'doctors', doctorId), {
          uid: doctorId,
          specializations: [],
          clinicAddress: 'Not set',
          schedule: {},
          consultationFee: 0,
          availability: !currentAvailability,
          profileStatus: 'Active' as UserStatus,
        });
      } else {
        // Update existing doctor profile
        const doctorDocId = doctorExistsQuery.docs[0].id;
        await updateDoc(doc(db, 'doctors', doctorDocId), {
          availability: !currentAvailability,
        });
      }

      toast({
        title: 'Availability Updated',
        description: `Doctor is now ${
          !currentAvailability ? 'available' : 'unavailable'
        } for appointments`,
      });
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update doctor availability',
        variant: 'destructive',
      });
    }
  };

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.userInfo?.fullName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      doctor.userInfo?.email
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      doctor.specializations.some((spec) =>
        spec.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  if (!isAuthorized) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Doctors</h1>
        <Button onClick={() => router.push('/dashboard')} variant="outline">
          Back to Dashboard
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Search Doctors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by name, email, or specialization..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading doctors...</p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-lg">
          <p className="text-gray-500">
            No doctors found matching your criteria
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Specializations</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors.map((doctor) => (
                  <TableRow key={doctor.uid}>
                    <TableCell className="font-medium">
                      {doctor.userInfo?.fullName}
                    </TableCell>
                    <TableCell>{doctor.userInfo?.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {doctor.specializations &&
                        doctor.specializations.length > 0 ? (
                          doctor.specializations.map((spec, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-blue-50"
                            >
                              {spec}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">
                            No specializations set
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          doctor.profileStatus === 'Active'
                            ? 'default'
                            : doctor.profileStatus === 'Pending'
                            ? 'outline'
                            : doctor.profileStatus === 'Suspended'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {doctor.profileStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span
                          className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            doctor.availability ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        ></span>
                        <span>
                          {doctor.availability ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/doctors/${doctor.uid}`)
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View Profile</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/dashboard/doctors/edit/${doctor.uid}`
                              )
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit Profile</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />

                          {/* Status actions */}
                          <DropdownMenuLabel>Status</DropdownMenuLabel>
                          {doctor.profileStatus !== 'Active' && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(doctor.uid, 'Active')
                              }
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              <span>Activate</span>
                            </DropdownMenuItem>
                          )}
                          {doctor.profileStatus !== 'Suspended' && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(doctor.uid, 'Suspended')
                              }
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              <span>Suspend</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />

                          {/* Availability toggle */}
                          <DropdownMenuLabel>Availability</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              toggleAvailability(
                                doctor.uid,
                                doctor.availability
                              )
                            }
                          >
                            <span>
                              {doctor.availability
                                ? 'Set as Unavailable'
                                : 'Set as Available'}
                            </span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
