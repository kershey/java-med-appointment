'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { getAllUsers, updateUserStatus } from '@/app/firebase/auth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertCircle,
  CheckCircle2,
  Users,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { UserStatus, UserRole } from '@/app/types';

interface User {
  id: string;
  email: string;
  fullName: string;
  userType: UserRole;
  status: UserStatus;
  createdAt: { seconds: number; nanoseconds: number } | null;
  emailVerified?: boolean;
}

export default function UserManagement() {
  const router = useRouter();
  const { user, userRole, loading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newStatus, setNewStatus] = useState<UserStatus | null>(null);

  // Protect route - only admins can access
  useEffect(() => {
    if (!loading && (!user || userRole !== 'Admin')) {
      router.push('/auth/login/admin');
    }
  }, [user, userRole, loading, router]);

  // Fetch users
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAllUsers();
      if (result.success) {
        setUsers(result.users as User[]);
        setFilteredUsers(result.users as User[]);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('An error occurred while fetching users');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (user && userRole === 'Admin') {
      fetchUsers();
    }
  }, [user, userRole]);

  // Apply filters
  useEffect(() => {
    if (users.length > 0) {
      let filtered = [...users];

      // Apply role filter
      if (userFilter !== 'all') {
        filtered = filtered.filter((user) => user.userType === userFilter);
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        filtered = filtered.filter((user) => user.status === statusFilter);
      }

      // Apply search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (user) =>
            user.fullName?.toLowerCase().includes(term) ||
            user.email?.toLowerCase().includes(term)
        );
      }

      setFilteredUsers(filtered);
    }
  }, [users, userFilter, statusFilter, searchTerm]);

  // Handle status change
  const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
    const userToUpdate = users.find((u) => u.id === userId);
    if (!userToUpdate) return;

    setSelectedUser(userToUpdate);
    setNewStatus(newStatus);
    setIsConfirmDialogOpen(true);
  };

  // Confirm status change
  const confirmStatusChange = async () => {
    if (!selectedUser || !newStatus) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateUserStatus(selectedUser.id, newStatus);
      if (result.success) {
        setSuccess(
          `Successfully updated status for ${selectedUser.fullName} to ${newStatus}`
        );
        // Update local state
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id ? { ...u, status: newStatus } : u
          )
        );
      } else {
        setError('Failed to update user status');
      }
    } catch (err) {
      console.error('Error updating user status:', err);
      setError('An error occurred while updating status');
    } finally {
      setIsLoading(false);
      setIsConfirmDialogOpen(false);
      setSelectedUser(null);
      setNewStatus(null);
    }
  };

  // If loading or not authenticated, show loading state
  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="size-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
        <p className="mt-6 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // If not admin, return null (useEffect will redirect)
  if (userRole !== 'Admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Users className="h-6 w-6" />
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage user accounts, permissions, and activation status
          </p>
        </div>
        <Button
          onClick={fetchUsers}
          variant="outline"
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters and Search */}
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
              <p className="text-sm font-medium">User Type</p>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="Doctor">Doctor</SelectItem>
                  <SelectItem value="Patient">Patient</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">Status</p>
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
              <p className="text-sm font-medium">Search</p>
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Messages */}
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <div className="size-10 border-t-4 border-primary border-solid rounded-full animate-spin mb-3"></div>
                        <p className="text-muted-foreground">
                          Loading users...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-muted-foreground">No users found.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.fullName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.userType === 'Admin'
                              ? 'default'
                              : user.userType === 'Doctor'
                              ? 'secondary'
                              : user.userType === 'Staff'
                              ? 'outline'
                              : 'ghost'
                          }
                        >
                          {user.userType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === 'Active'
                              ? 'success'
                              : user.status === 'Inactive'
                              ? 'destructive'
                              : 'outline'
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          onValueChange={(value) =>
                            handleStatusChange(user.id, value as UserStatus)
                          }
                          defaultValue={user.status}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue placeholder="Change Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Activate</SelectItem>
                            <SelectItem value="Inactive">Deactivate</SelectItem>
                            <SelectItem value="Suspended">Suspend</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to change the status of{' '}
              <strong>{selectedUser?.fullName}</strong> to{' '}
              <strong>{newStatus}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmStatusChange}
              disabled={isLoading}
              className="gap-1"
            >
              {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
