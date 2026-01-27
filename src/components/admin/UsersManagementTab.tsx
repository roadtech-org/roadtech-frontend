import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/admin';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  Input,
  Select,
} from '../common';
import {
  User,
  Mail,
  Phone,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Search,
} from 'lucide-react';
import type { UserRole } from '../../types';

const roleOptions = [
  { value: '', label: 'All Roles' },
  { value: 'USER', label: 'Users' },
  { value: 'MECHANIC', label: 'Mechanics' },
  { value: 'PARTS_PROVIDER', label: 'Parts Providers' },
  { value: 'ADMIN', label: 'Admins' },
];

const roleColors: Record<
  UserRole,
  'default' | 'info' | 'warning' | 'success' | 'danger'
> = {
  USER: 'default',
  MECHANIC: 'info',
  PARTS_PROVIDER: 'warning',
  ADMIN: 'danger',
};

export function UsersManagementTab() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['adminUsers', roleFilter, searchQuery, page],
    queryFn: () => adminApi.getAllUsers(roleFilter, searchQuery, page, 10),
  });

  const toggleMutation = useMutation({
    mutationFn: adminApi.toggleUserActive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User status updated');
    },
    onError: () => toast.error('Failed to update user status'),
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast.success('User deleted successfully');
    },
    onError: () => toast.error('Failed to delete user'),
  });

  const handleDelete = (id: number, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete user "${name}"? This action cannot be undone.`
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Filter by Role"
              options={roleOptions}
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(0);
              }}
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Users
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search by name or email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({usersData?.totalElements || 0})</CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
            </div>
          ) : usersData?.content?.length ? (
            <div className="space-y-4">
              {usersData.content.map((user: any) => (
                <div
                  key={user.id}
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border ${
                    user.isActive
                      ? 'bg-white border-gray-200'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  {/* Left section */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        user.isActive ? 'bg-blue-100' : 'bg-gray-200'
                      }`}
                    >
                      <User
                        className={`h-6 w-6 ${
                          user.isActive ? 'text-blue-600' : 'text-gray-400'
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3
                          className={`font-semibold ${
                            user.isActive
                              ? 'text-gray-900'
                              : 'text-gray-500'
                          }`}
                        >
                          {user.fullName}
                        </h3>

                        <Badge variant={roleColors[user.role as UserRole]}>
                          {user.role}
                        </Badge>

                        {!user.isActive && (
                          <Badge variant="danger">Inactive</Badge>
                        )}

                        {user.isVerified && (
                          <Badge variant="success">Verified</Badge>
                        )}
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 shrink-0" />
                          <span className="break-all sm:break-normal">
                            {user.email}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 shrink-0" />
                          <span>{user.phone}</span>
                        </div>

                        <div className="text-xs text-gray-500">
                          Joined:{' '}
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleMutation.mutate(user.id)}
                      isLoading={toggleMutation.isPending}
                      title={user.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {user.isActive ? (
                        <ToggleRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>

                    {user.role !== 'ADMIN' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleDelete(user.id, user.fullName)
                        }
                        isLoading={deleteMutation.isPending}
                        className="text-red-600 hover:bg-red-50"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {usersData.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-gray-600">
                    Page {page + 1} of {usersData.totalPages}
                  </span>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setPage((p) =>
                          Math.min(usersData.totalPages - 1, p + 1)
                        )
                      }
                      disabled={page >= usersData.totalPages - 1}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
