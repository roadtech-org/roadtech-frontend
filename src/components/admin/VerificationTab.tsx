import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/admin';
import { Card, CardContent, Badge, Button } from '../common';
import {Mail, Phone, CheckCircle, XCircle, Wrench, Package, MapPin } from 'lucide-react';

type VerificationType = 'mechanics' | 'providers';

export function VerificationTab() {
  const queryClient = useQueryClient();
  const [activeType, setActiveType] = useState<VerificationType>('mechanics');
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Fetch pending mechanics
  const { data: pendingMechanics, isLoading: isLoadingMechanics } = useQuery({
    queryKey: ['pendingMechanics'],
    queryFn: adminApi.getPendingMechanics,
    enabled: activeType === 'mechanics',
  });

  // Fetch pending providers
  const { data: pendingProviders, isLoading: isLoadingProviders } = useQuery({
    queryKey: ['pendingProviders'],
    queryFn: adminApi.getPendingProviders,
    enabled: activeType === 'providers',
  });

  // Verify mechanic mutation
 const verifyMechanicMutation = useMutation({
  mutationFn: (id: number) =>
    adminApi.verifyMechanic(id, 'Verified by admin'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingMechanics'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast.success('Mechanic verified successfully! ✅');
    },
    onError: () => {
      toast.error('Failed to verify mechanic');
    },
  });

  // Reject mechanic mutation
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
    onError: () => {
      toast.error('Failed to reject verification');
    },
  });

  // Verify provider mutation
  const verifyProviderMutation = useMutation({
    mutationFn: (id: number) => adminApi.verifyProvider(id, 'Verified by admin'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingProviders'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast.success('Parts provider verified successfully! ✅');
    },
    onError: () => {
      toast.error('Failed to verify provider');
    },
  });

  // Reject provider mutation
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
    onError: () => {
      toast.error('Failed to reject verification');
    },
  });

  const handleReject = (id: number, type: 'mechanic' | 'provider') => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    if (type === 'mechanic') {
      rejectMechanicMutation.mutate({ id, reason: rejectReason });
    } else {
      rejectProviderMutation.mutate({ id, reason: rejectReason });
    }
  };

  const isLoading = activeType === 'mechanics' ? isLoadingMechanics : isLoadingProviders;
  const data = activeType === 'mechanics' ? pendingMechanics : pendingProviders;

  return (
    <div className="space-y-6">
      {/* Type Toggle */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveType('mechanics')}
          className={`pb-4 px-2 font-medium text-sm flex items-center ${
            activeType === 'mechanics'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Wrench className="h-4 w-4 mr-2" />
          Mechanics
          {pendingMechanics && pendingMechanics.length > 0 && (
            <Badge variant="warning" className="ml-2">
              {pendingMechanics.length}
            </Badge>
          )}
        </button>
        <button
          onClick={() => setActiveType('providers')}
          className={`pb-4 px-2 font-medium text-sm flex items-center ${
            activeType === 'providers'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Package className="h-4 w-4 mr-2" />
          Parts Providers
          {pendingProviders && pendingProviders.length > 0 && (
            <Badge variant="warning" className="ml-2">
              {pendingProviders.length}
            </Badge>
          )}
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {data.map((item: any) => (
            <Card key={item.id}>
              <CardContent className="py-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {activeType === 'mechanics' ? (
                        <Wrench className="h-6 w-6 text-blue-600" />
                      ) : (
                        <Package className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {item.user?.fullName || item.shopName}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          <span>{item.user?.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{item.user?.phone || item.phone}</span>
                        </div>
                        {activeType === 'mechanics' && item.specializations && (
                          <div className="flex items-start">
                            <Wrench className="h-4 w-4 mr-2 mt-0.5" />
                            <span>
                              Specializations:{' '}
                              {item.specializations.map((s: string) => s.replace('_', ' ')).join(', ')}
                            </span>
                          </div>
                        )}
                        {activeType === 'providers' && (
                          <>
                            <div className="flex items-start">
                              <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                              <span>{item.address}</span>
                            </div>
                            <div className="flex items-center">
                              <Package className="h-4 w-4 mr-2" />
                              <span>Shop: {item.shopName}</span>
                            </div>
                          </>
                        )}
                        <div className="text-xs text-gray-500">
                          Requested: {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Rejection Form */}
                      {rejectingId === item.id && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason for Rejection
                          </label>
                          <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            rows={3}
                            placeholder="Explain why this verification is being rejected..."
                          />
                          <div className="flex space-x-2 mt-3">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(item.id, activeType === 'mechanics' ? 'mechanic' : 'provider')}
                              isLoading={rejectMechanicMutation.isPending || rejectProviderMutation.isPending}
                            >
                              Confirm Reject
                            </Button>
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
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {rejectingId !== item.id && (
                    <div className="flex space-x-2 flex-shrink-0">
                      <Button
                        size="sm"
                        onClick={() =>
                          activeType === 'mechanics'
                            ? verifyMechanicMutation.mutate(item.id)
                            : verifyProviderMutation.mutate(item.id)
                        }
                        isLoading={verifyMechanicMutation.isPending || verifyProviderMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRejectingId(item.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            {activeType === 'mechanics' ? (
              <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            ) : (
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            )}
            <p className="text-gray-500">
              No pending {activeType === 'mechanics' ? 'mechanic' : 'parts provider'} verifications
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}