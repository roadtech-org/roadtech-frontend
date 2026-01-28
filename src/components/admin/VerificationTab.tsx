import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/admin';
import { Card, CardContent, Badge, Button } from '../common';
import {
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Wrench,
  Package,
  MapPin,
} from 'lucide-react';

/**
 * Type to control which verification list is active
 */
type VerificationType = 'mechanics' | 'providers';

export function VerificationTab() {
  const queryClient = useQueryClient();

  /** Active tab */
  const [activeType, setActiveType] = useState<VerificationType>('mechanics');

  /** Rejection state */
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  /* ----------------------- DATA FETCHING ----------------------- */

  const { data: pendingMechanics, isLoading: isLoadingMechanics } = useQuery({
    queryKey: ['pendingMechanics'],
    queryFn: adminApi.getPendingMechanics,
    enabled: activeType === 'mechanics',
  });

  const { data: pendingProviders, isLoading: isLoadingProviders } = useQuery({
    queryKey: ['pendingProviders'],
    queryFn: adminApi.getPendingProviders,
    enabled: activeType === 'providers',
  });

  /* ----------------------- MUTATIONS ----------------------- */

  const verifyMechanicMutation = useMutation({
    mutationFn: (id: number) =>
      adminApi.verifyMechanic(id, 'Verified by admin'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingMechanics'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast.success('Mechanic verified successfully! ✅');
    },
    onError: () => toast.error('Failed to verify mechanic'),
  });

  const rejectMechanicMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      adminApi.rejectMechanic(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingMechanics'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast.success('Mechanic verification rejected');
      setRejectingId(null);
      setRejectReason('');
    },
    onError: () => toast.error('Failed to reject verification'),
  });

  const verifyProviderMutation = useMutation({
    mutationFn: (id: number) =>
      adminApi.verifyProvider(id, 'Verified by admin'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingProviders'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast.success('Parts provider verified successfully! ✅');
    },
    onError: () => toast.error('Failed to verify provider'),
  });

  const rejectProviderMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      adminApi.rejectProvider(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingProviders'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast.success('Provider verification rejected');
      setRejectingId(null);
      setRejectReason('');
    },
    onError: () => toast.error('Failed to reject verification'),
  });

  /* ----------------------- HELPERS ----------------------- */

  const handleReject = (id: number, type: 'mechanic' | 'provider') => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    type === 'mechanic'
      ? rejectMechanicMutation.mutate({ id, reason: rejectReason })
      : rejectProviderMutation.mutate({ id, reason: rejectReason });
  };

  const isLoading =
    activeType === 'mechanics'
      ? isLoadingMechanics
      : isLoadingProviders;

  const data =
    activeType === 'mechanics'
      ? pendingMechanics
      : pendingProviders;

  /* ----------------------- UI ----------------------- */

  return (
    <div className="space-y-6">
      {/* TAB SWITCHER */}
      <div className="flex gap-6 border-b border-gray-200">
        <button
          onClick={() => setActiveType('mechanics')}
          className={`pb-4 text-sm font-medium flex items-center gap-2 ${
            activeType === 'mechanics'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Wrench className="h-4 w-4" />
          Mechanics
          {pendingMechanics?.length > 0 && (
            <Badge variant="warning">{pendingMechanics.length}</Badge>
          )}
        </button>

        <button
          onClick={() => setActiveType('providers')}
          className={`pb-4 text-sm font-medium flex items-center gap-2 ${
            activeType === 'providers'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Package className="h-4 w-4" />
          Parts Providers
          {pendingProviders?.length > 0 && (
            <Badge variant="warning">{pendingProviders.length}</Badge>
          )}
        </button>
      </div>

      {/* LOADING */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      ) : data?.length ? (
        <div className="grid gap-5">
          {data.map((item: any) => (
            <Card key={item.id}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row gap-4 sm:justify-between">
                  {/* LEFT INFO */}
                  <div className="flex gap-4 flex-1">
                    <div className="h-12 w-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                      {activeType === 'mechanics' ? (
                        <Wrench className="text-blue-600" />
                      ) : (
                        <Package className="text-blue-600" />
                      )}
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <h3 className="font-semibold text-gray-900">
                        {item.user?.fullName || item.shopName}
                      </h3>

                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {item.user?.email}
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {item.user?.phone || item.phone}
                      </div>

                      {activeType === 'mechanics' && item.specializations && (
                        <div className="flex gap-2">
                          <Wrench className="h-4 w-4 mt-0.5" />
                          Specializations: {item.specializations.join(', ')}
                        </div>
                      )}

                      {activeType === 'providers' && (
                        <>
                          <div className="flex gap-2">
                            <MapPin className="h-4 w-4 mt-0.5" />
                            {item.address}
                          </div>
                          <div className="flex gap-2">
                            <Package className="h-4 w-4" />
                            Shop: {item.shopName}
                          </div>
                        </>
                      )}

                      <p className="text-xs text-gray-500">
                        Requested:{' '}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  {rejectingId !== item.id && (
                    <div className="flex sm:flex-col gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() =>
                          activeType === 'mechanics'
                            ? verifyMechanicMutation.mutate(item.id)
                            : verifyProviderMutation.mutate(item.id)
                        }
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setRejectingId(item.id);
                          setRejectReason('');
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Ignore
                      </Button>
                    </div>
                  )}
                </div>

                {/* REJECT REASON */}
                {rejectingId === item.id && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-red-700 mb-2">
                      Rejection Reason
                    </label>

                    <textarea
                      rows={3}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Enter rejection reason..."
                      className="w-full rounded-md border border-red-300 p-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />

                    <div className="flex justify-end gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRejectingId(null);
                          setRejectReason('');
                        }}
                      >
                        Cancel
                      </Button>

                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() =>
                          handleReject(
                            item.id,
                            activeType === 'mechanics'
                              ? 'mechanic'
                              : 'provider'
                          )
                        }
                      >
                        Confirm Reject
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No pending verifications
          </CardContent>
        </Card>
      )}
    </div>
  );
}
