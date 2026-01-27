import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { partsProviderApi } from '../../api/partsProvider';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '../../components/common';
import { Plus, Package, DollarSign, Store, Power, Edit, Trash2 } from 'lucide-react';
import { AddPartModal } from '../../components/parts/AddPartModal';
import { EditPartModal } from '../../components/parts/EditPartModal';
import type { Part } from '../../types';

export function PartsProviderDashboard() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);

  // Get provider profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['partsProviderProfile'],
    queryFn: partsProviderApi.getProfile,
  });

  // Get parts
  const { data: parts, isLoading: isLoadingParts } = useQuery({
    queryKey: ['myParts'],
    queryFn: partsProviderApi.getMyParts,
  });

  // Toggle shop status
  const toggleMutation = useMutation({
    mutationFn: (isOpen: boolean) => partsProviderApi.toggleStatus(isOpen),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partsProviderProfile'] });
      toast.success('Shop status updated!');
    },
    onError: () => {
      toast.error('Failed to update shop status');
    },
  });

  // Delete part
  const deleteMutation = useMutation({
    mutationFn: partsProviderApi.deletePart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myParts'] });
      toast.success('Part deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete part');
    },
  });

  const handleToggleStatus = () => {
    toggleMutation.mutate(!profile?.isOpen);
  };

  const handleDeletePart = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalValue = parts?.reduce((sum, part) => sum + (part.price * part.stock), 0) || 0;
  const totalItems = parts?.reduce((sum, part) => sum + part.stock, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{profile?.shopName}</h1>
          <p className="text-gray-600 mt-1">Parts Provider Dashboard</p>
          {!profile?.isVerified && (
            <Badge variant="warning" className="mt-2">Pending Verification</Badge>
          )}
        </div>

        <div className="mt-4 sm:mt-0 flex gap-2">
          <Button
            size="lg"
            variant={profile?.isOpen ? 'primary' : 'outline'}
            onClick={handleToggleStatus}
            isLoading={toggleMutation.isPending}
            className={profile?.isOpen ? 'bg-green-600 hover:bg-green-700' : ''}
            disabled={!profile?.isVerified}
          >
            <Power className="h-5 w-5 mr-2" />
            {profile?.isOpen ? 'Shop Open' : 'Shop Closed'}
          </Button>
          <Button
            size="lg"
            onClick={() => setShowAddModal(true)}
            disabled={!profile?.isVerified}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Part
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${profile?.isOpen ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Store className={`h-6 w-6 ${profile?.isOpen ? 'text-green-600' : 'text-gray-600'}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Status</p>
                <p className={`text-lg font-bold ${profile?.isOpen ? 'text-green-600' : 'text-gray-600'}`}>
                  {profile?.isOpen ? 'Open' : 'Closed'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Parts</p>
                <p className="text-2xl font-bold">{parts?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Stock Items</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Inventory Value</p>
                <p className="text-2xl font-bold">₹{totalValue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parts List */}
      <Card>
        <CardHeader>
          <CardTitle>Parts Inventory</CardTitle>
        </CardHeader>
        <CardContent>
  {isLoadingParts ? (
    <p className="text-gray-500">Loading...</p>
  ) : parts && parts.length > 0 ? (
    <div className="space-y-3">
      {parts.map((part: Part) => (
        <div
          key={part.id}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50 rounded-lg"
        >
          {/* Left section */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {part.imageUrl && (
              <img
                src={part.imageUrl}
                alt={part.name}
                className="h-16 w-16 object-cover rounded shrink-0"
              />
            )}

            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900">
                {part.name}
              </h3>
              <p className="text-sm text-gray-600 wrap-break-word">
                {part.brand} - {part.category}
              </p>
              {part.description && (
                <p className="text-sm text-gray-500 mt-1 wrap-break-word">
                  {part.description}
                </p>
              )}
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center justify-between sm:justify-end gap-6">
            <div className="text-right">
              <p className="text-sm text-gray-600">Stock</p>
              <p
                className={`font-bold ${
                  part.stock < 10 ? 'text-red-600' : 'text-gray-900'
                }`}
              >
                {part.stock}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-600">Price</p>
              <p className="font-bold text-gray-900">
                ₹{part.price}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingPart(part)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeletePart(part.id, part.name)}
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-12">
      <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500">No parts added yet</p>
      <Button className="mt-4" onClick={() => setShowAddModal(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Your First Part
      </Button>
    </div>
  )}
</CardContent>

      </Card>

      {/* Modals */}
      {showAddModal && (
        <AddPartModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            queryClient.invalidateQueries({ queryKey: ['myParts'] });
          }}
        />
      )}

      {editingPart && (
        <EditPartModal
          part={editingPart}
          onClose={() => setEditingPart(null)}
          onSuccess={() => {
            setEditingPart(null);
            queryClient.invalidateQueries({ queryKey: ['myParts'] });
          }}
        />
      )}
    </div>
  );
}