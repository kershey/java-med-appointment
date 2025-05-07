'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { User, DoctorProfile, UserStatus } from '@/app/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Filter,
  Edit,
  UserCog,
} from 'lucide-react';
import { MultiSelector } from '@/app/components/ui-custom/MultiSelector';

interface DoctorWithUserInfo extends DoctorProfile {
  userInfo?: User;
}

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
];

export default function DoctorManagementPage() {
  const router = useRouter();
  const { user, userRole, loading } = useAuth();
  const [doctors, setDoctors] = useState<DoctorWithUserInfo[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorWithUserInfo[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [specializationFilter, setSpecializationFilter] =
    useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Edit doctor dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] =
    useState<DoctorWithUserInfo | null>(null);
  const [editForm, setEditForm] = useState({
    specializations: [] as string[],
    clinicAddress: '',
    consultationFee: 0,
    bio: '',
    availability: true,
    profileStatus: 'Active' as UserStatus,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Protect route - only admins can access
  useEffect(() => {
    if (!loading && (!user || userRole !== 'Admin')) {
      router.push('/auth/login');
    }
  }, [user, userRole, loading, router]);

  // Fetch all doctors - wrapped in useCallback
  const fetchDoctors = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const doctorsQuery = collection(db, 'doctors');
      const doctorsSnapshot = await getDocs(doctorsQuery);

      const doctorsData = doctorsSnapshot.docs.map(
        (doc) => ({ ...doc.data(), uid: doc.id } as DoctorProfile)
      );

      // Get corresponding user data for each doctor
      const doctorsWithUserInfo: DoctorWithUserInfo[] = [];

      for (const doctor of doctorsData) {
        const userQuery = query(
          collection(db, 'users'),
          where('uid', '==', doctor.uid)
        );
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data() as User;
          doctorsWithUserInfo.push({
            ...doctor,
            userInfo: userData,
          });
        } else {
          doctorsWithUserInfo.push(doctor);
        }
      }

      setDoctors(doctorsWithUserInfo);
      setFilteredDoctors(doctorsWithUserInfo);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctor data');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    if (user && userRole === 'Admin') {
      fetchDoctors();
    }
  }, [user, userRole, fetchDoctors]);

  // Apply filters
  useEffect(() => {
    if (doctors.length > 0) {
      let filtered = [...doctors];

      // Apply status filter
      if (statusFilter !== 'all') {
        filtered = filtered.filter(
          (doctor) => doctor.profileStatus === statusFilter
        );
      }

      // Apply specialization filter
      if (specializationFilter !== 'all') {
        filtered = filtered.filter((doctor) =>
          doctor.specializations.includes(specializationFilter)
        );
      }

      // Apply search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (doctor) =>
            doctor.userInfo?.fullName?.toLowerCase().includes(term) ||
            doctor.specializations.some((spec) =>
              spec.toLowerCase().includes(term)
            )
        );
      }

      setFilteredDoctors(filtered);
    }
  }, [doctors, statusFilter, specializationFilter, searchTerm]);

  // Open edit dialog
  const handleEditDoctor = (doctor: DoctorWithUserInfo) => {
    setSelectedDoctor(doctor);
    setEditForm({
      specializations: doctor.specializations,
      clinicAddress: doctor.clinicAddress,
      consultationFee: doctor.consultationFee,
      bio: doctor.bio || '',
      availability: doctor.availability,
      profileStatus: doctor.profileStatus,
    });
    setIsEditDialogOpen(true);
  };

  // Save doctor changes
  const handleSaveDoctor = async () => {
    if (!selectedDoctor) return;

    setIsSaving(true);
    setError(null);

    try {
      const doctorRef = doc(db, 'doctors', selectedDoctor.uid);

      await updateDoc(doctorRef, {
        specializations: editForm.specializations,
        clinicAddress: editForm.clinicAddress,
        consultationFee: editForm.consultationFee,
        bio: editForm.bio,
        availability: editForm.availability,
        profileStatus: editForm.profileStatus,
      });

      // Update local state
      setDoctors((prev) =>
        prev.map((doc) =>
          doc.uid === selectedDoctor.uid
            ? {
                ...doc,
                specializations: editForm.specializations,
                clinicAddress: editForm.clinicAddress,
                consultationFee: editForm.consultationFee,
                bio: editForm.bio,
                availability: editForm.availability,
                profileStatus: editForm.profileStatus,
              }
            : doc
        )
      );

      setSuccess(
        `Doctor profile for ${selectedDoctor.userInfo?.fullName} updated successfully`
      );
      setIsEditDialogOpen(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating doctor profile:', err);
      setError('Failed to update doctor profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvailabilityChange = (checked: boolean) => {
    setEditForm((prev) => ({ ...prev, availability: checked }));
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="size-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <UserCog className="h-6 w-6" />
            Doctor Management
          </h1>
          <p className="text-muted-foreground">
            Manage doctor profiles, specializations, and approval status
          </p>
        </div>
        <Button
          onClick={fetchDoctors}
          variant="outline"
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 p-4 rounded-lg flex items-start gap-3 text-destructive">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 p-4 rounded-lg flex items-start gap-3 text-green-600">
          <CheckCircle2 className="h-5 w-5 mt-0.5" />
          <p>{success}</p>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-1">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-1">
              <Label>Specialization</Label>
              <Select
                value={specializationFilter}
                onValueChange={setSpecializationFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  {specializations.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-1">
              <Label>Search</Label>
              <Input
                placeholder="Search by name or specialization"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Doctors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Doctors</CardTitle>
          <CardDescription>
            Found {filteredDoctors.length} doctor
            {filteredDoctors.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Specializations</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      Loading doctor profiles...
                    </TableCell>
                  </TableRow>
                ) : filteredDoctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      No doctor profiles found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDoctors.map((doctor) => (
                    <TableRow key={doctor.uid}>
                      <TableCell className="font-medium">
                        {doctor.userInfo?.fullName || 'Unknown Doctor'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {doctor.specializations.slice(0, 2).map((spec, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="bg-blue-50"
                            >
                              {spec}
                            </Badge>
                          ))}
                          {doctor.specializations.length > 2 && (
                            <Badge variant="outline">
                              +{doctor.specializations.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        ₱{doctor.consultationFee.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            doctor.profileStatus === 'Active'
                              ? 'default'
                              : doctor.profileStatus === 'Pending'
                              ? 'outline'
                              : 'destructive'
                          }
                        >
                          {doctor.profileStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            doctor.availability ? 'default' : 'secondary'
                          }
                          className={
                            doctor.availability
                              ? 'bg-green-100 text-green-800'
                              : ''
                          }
                        >
                          {doctor.availability ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditDoctor(doctor)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Doctor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Edit Doctor Profile - {selectedDoctor?.userInfo?.fullName}
            </DialogTitle>
            <DialogDescription>
              Update professional details, specializations, and availability
              status
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-specializations">Specializations</Label>
              <MultiSelector
                options={specializations.map((spec) => ({
                  value: spec,
                  label: spec,
                }))}
                selected={editForm.specializations.map((spec) => ({
                  value: spec,
                  label: spec,
                }))}
                onChange={(selected) =>
                  setEditForm((prev) => ({
                    ...prev,
                    specializations: selected.map((item) => item.value),
                  }))
                }
                placeholder="Select specializations"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-clinic-address">Clinic Address</Label>
              <Textarea
                id="edit-clinic-address"
                value={editForm.clinicAddress}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    clinicAddress: e.target.value,
                  }))
                }
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-fee">Consultation Fee (₱)</Label>
                <Input
                  id="edit-fee"
                  type="number"
                  min="0"
                  value={editForm.consultationFee}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      consultationFee: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Profile Status</Label>
                <Select
                  value={editForm.profileStatus}
                  onValueChange={(value: UserStatus) =>
                    setEditForm((prev) => ({
                      ...prev,
                      profileStatus: value,
                    }))
                  }
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-bio">Professional Bio</Label>
              <Textarea
                id="edit-bio"
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, bio: e.target.value }))
                }
                rows={4}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="edit-availability">
                Available for Appointments
              </Label>
              <Switch
                id="edit-availability"
                checked={editForm.availability}
                onCheckedChange={handleAvailabilityChange}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveDoctor} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
